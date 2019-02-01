import * as React from 'react';
import { TimeGraphContainer, TimeGraphContainerOptions } from 'timeline-chart/lib/time-graph-container';
import { TimeGraphUnitController } from 'timeline-chart/lib/time-graph-unit-controller';
import { TimeGraphAxis } from 'timeline-chart/lib/layer/time-graph-axis';
import { TimeGraphAxisCursors } from 'timeline-chart/lib/layer/time-graph-axis-cursors';
import { TimeGraphChartGrid } from 'timeline-chart/lib/layer/time-graph-chart-grid';
import { TimeGraphChart, TimeGraphChartProviders } from 'timeline-chart/lib/layer/time-graph-chart';
import { TimeGraphChartCursors } from 'timeline-chart/lib/layer/time-graph-chart-cursors';
import { TimeGraphChartSelectionRange } from 'timeline-chart/lib/layer/time-graph-chart-selection-range';
import { TimeGraphNavigator } from 'timeline-chart/lib/layer/time-graph-navigator';
import { TimeGraphVerticalScrollbar } from 'timeline-chart/lib/layer/time-graph-vertical-scrollbar';
import { TimeGraphLayer } from 'timeline-chart/lib/layer/time-graph-layer';
import { TimeGraphRowElementStyle, TimeGraphRowElement } from 'timeline-chart/lib/components/time-graph-row-element';
import { TimeGraphRowController } from 'timeline-chart/lib/time-graph-row-controller';
import { TimelineChart } from 'timeline-chart/lib/time-graph-model';
import { ProfileDataProvider } from '../common/profile-data-provider';
import { FileResourceResolver } from '@theia/filesystem/lib/browser/file-resource';

export class TimeGraphView {

    protected styleConfig = {
        mainWidth: 1000,
        mainHeight: 300,
        naviBackgroundColor: 0xf7eaaf,
        chartBackgroundColor: 0xf9f6e8,
        cursorColor: 0xb77f09
    }
    protected rowHeight = 15;
    protected totalHeight: number = 0;

    protected unitController: TimeGraphUnitController;
    protected rowController: TimeGraphRowController;
    protected dataProvider: ProfileDataProvider;

    protected timeGraphData?: TimelineChart.TimeGraphModel;

    protected chartLayer: TimeGraphChart;
    // protected arrows: TimeGraphChartArrows;
    protected vscrollLayer: TimeGraphVerticalScrollbar;

    protected styleMap = new Map<string, TimeGraphRowElementStyle>();

    protected horizontalContainer: React.RefObject<HTMLDivElement>;

    protected widgetResizeHandlers: (() => void)[] = [];
    protected readonly addWidgetResizeHandler = (h: () => void) => {
        this.widgetResizeHandlers.push(h);
    }

    constructor(uri: string, resourceResolver: FileResourceResolver, protected updateHandler: () => void) {
        this.dataProvider = new ProfileDataProvider(uri, resourceResolver);
        this.unitController = new TimeGraphUnitController(0);
        this.rowController = new TimeGraphRowController(this.rowHeight, this.totalHeight);

        this.unitController.scaleSteps = [1, 2, 5, 10];

        const providers: TimeGraphChartProviders = {
            dataProvider: async (range: TimelineChart.TimeGraphRange, resolution: number) => {
                if (this.unitController) {
                    const length = range.end - range.start;
                    const overlap = ((length * 5) - length) / 2;
                    const start = range.start - overlap > 0 ? range.start - overlap : 0;
                    const end = range.end + overlap < this.unitController.absoluteRange ? range.end + overlap : this.unitController.absoluteRange;
                    const newRange: TimelineChart.TimeGraphRange = { start, end };
                    const newResolution: number = resolution * 0.8;
                    this.timeGraphData = await this.dataProvider.getData();
                    if (selectedElement) {
                        for (const row of this.timeGraphData.rows) {
                            const selEl = row.states.find(el => el.id === selectedElement.id);
                            if (selEl) {
                                selEl.selected = true;
                                break;
                            }
                        }
                    }
                    return {
                        rows: this.timeGraphData.rows,
                        range: newRange,
                        resolution: newResolution
                    };
                }
                return {
                    rows: [],
                    range: { start: 0, end: 0 },
                    resolution: 0
                };
            },
            rowElementStyleProvider: (model: TimelineChart.TimeGraphRowElementModel) => {
                const styles: TimeGraphRowElementStyle[] = [
                    {
                        color: 0x11ad1b,
                        height: this.rowHeight * 0.8
                    }, {
                        color: 0xbc2f00,
                        height: this.rowHeight * 0.7
                    }, {
                        color: 0xccbf5d,
                        height: this.rowHeight * 0.6
                    }
                ];
                let style: TimeGraphRowElementStyle | undefined = styles[0];
                const val = model.label;

                style = this.styleMap.get(val);
                if (!style) {
                    style = styles[(this.styleMap.size % styles.length)];
                    this.styleMap.set(val, style);
                }
                return {
                    color: style.color,
                    height: style.height,
                    borderWidth: model.selected ? 2 : 0,
                    borderColor: 0x000000
                };
            },
            rowStyleProvider: (row: TimelineChart.TimeGraphRowModel) => {
                return {
                    backgroundColor: 0xe0ddcf,
                    backgroundOpacity: row.selected ? 0.6 : 0,
                    lineColor: row.data && row.data.hasStates ? 0xdddddd : 0xaa4444,
                    lineThickness: row.data && row.data.hasStates ? 1 : 3
                }
            }
        }

        this.horizontalContainer = React.createRef();

        this.chartLayer = new TimeGraphChart('timeGraphChart', providers, this.rowController);
        let selectedElement: TimeGraphRowElement;
        this.chartLayer.onSelectedRowElementChanged((model) => {
            const el = this.chartLayer.getElementById(model.id);
            if (el) {
                selectedElement = el;
            }
        });
        this.vscrollLayer = new TimeGraphVerticalScrollbar('timeGraphVerticalScrollbar', this.rowController);
        this.initialize();
    }

    protected async initialize() {
        this.timeGraphData = await this.dataProvider.getData();
        this.unitController.absoluteRange = this.timeGraphData.totalLength;
        this.unitController.numberTranslator = (theNumber: number) => {
            return theNumber.toString();
        };
        this.unitController.viewRange = {
            start: 0,
            end: this.unitController.absoluteRange
        }
        this.totalHeight = this.timeGraphData.rows.length * this.rowHeight;
        this.rowController.totalHeight = this.totalHeight;
        this.onWidgetResize();
    }

    renderTimeGraphChart(): React.ReactNode {
        return <React.Fragment>
            {this.renderMainGraphContent()};
            <div id='main-vscroll'>
                {this.getVerticalScrollbar()}
            </div>
        </React.Fragment >
    }

    onWidgetResize() {
        this.styleConfig.mainWidth = this.horizontalContainer.current ? this.horizontalContainer.current.clientWidth : 1000;
        this.updateHandler();
        this.widgetResizeHandlers.forEach(h => h());
    }

    protected renderMainGraphContent() {
        return <div id='main-timegraph-content' ref={this.horizontalContainer}>
            {this.getAxisContainer()}
            {this.getChartContainer()}
            {this.getNaviContainer()}
        </div>
    }

    protected getAxisContainer() {
        const axisLayer = this.getAxisLayer();
        const axisCursorLayer = this.getAxisCursors();
        return <ReactTimeGraphContainer
            id='timegraph-axis'
            options={{
                id: 'timegraph-axis',
                height: 30,
                width: this.styleConfig.mainWidth,
                backgroundColor: 0xFFFFFF,
                classNames: 'horizontal-canvas'
            }}
            onWidgetResize={this.addWidgetResizeHandler}
            unitController={this.unitController}
            layer={[axisLayer, axisCursorLayer]}>
        </ReactTimeGraphContainer>;
    }

    protected getAxisLayer() {
        const timeAxisLayer = new TimeGraphAxis('timeGraphAxis', { color: this.styleConfig.naviBackgroundColor });
        return timeAxisLayer;
    }

    protected getAxisCursors() {
        return new TimeGraphAxisCursors('timeGraphAxisCursors', { color: this.styleConfig.cursorColor });
    }

    protected getChartContainer() {
        const grid = new TimeGraphChartGrid('timeGraphGrid', this.rowHeight);

        const cursors = new TimeGraphChartCursors('chart-cursors', this.chartLayer, this.rowController, { color: this.styleConfig.cursorColor });
        const selectionRange = new TimeGraphChartSelectionRange('chart-selection-range', { color: this.styleConfig.cursorColor });

        return <ReactTimeGraphContainer
            options={
                {
                    id: 'timegraph-chart',
                    height: this.styleConfig.mainHeight,
                    width: this.styleConfig.mainWidth,
                    backgroundColor: this.styleConfig.chartBackgroundColor,
                    classNames: 'horizontal-canvas'
                }
            }
            onWidgetResize={this.addWidgetResizeHandler}
            unitController={this.unitController}
            id='timegraph-chart'
            layer={[
                grid, this.chartLayer, selectionRange, cursors
            ]}
        >
        </ReactTimeGraphContainer>;
    }

    protected getNaviContainer() {
        const navi = new TimeGraphNavigator('timeGraphNavigator');
        return <ReactTimeGraphContainer
            id='navi'
            options={{
                width: this.styleConfig.mainWidth,
                height: 10,
                id: 'navi',
                backgroundColor: this.styleConfig.naviBackgroundColor,
                classNames: 'horizontal-canvas'
            }}
            onWidgetResize={this.addWidgetResizeHandler}
            unitController={this.unitController}
            layer={[navi]}
        ></ReactTimeGraphContainer>
    }

    protected getVerticalScrollbar() {
        return <ReactTimeGraphContainer
            id='vscroll'
            options={{
                id: 'vscroll',
                width: 10,
                height: this.styleConfig.mainHeight,
                backgroundColor: this.styleConfig.naviBackgroundColor
            }}
            onWidgetResize={this.addWidgetResizeHandler}
            unitController={this.unitController}
            layer={[this.vscrollLayer]}
        ></ReactTimeGraphContainer>;
    }
}

export namespace ReactTimeGraphContainer {
    export interface Props {
        id: string,
        options: TimeGraphContainerOptions,
        unitController: TimeGraphUnitController,
        layer: TimeGraphLayer[],
        onWidgetResize: (handler: () => void) => void
    }
}

export class ReactTimeGraphContainer extends React.Component<ReactTimeGraphContainer.Props> {
    protected ref: HTMLCanvasElement | undefined;
    protected container?: TimeGraphContainer;

    componentDidMount() {
        this.container = new TimeGraphContainer(this.props.options, this.props.unitController, this.ref);
        this.props.layer.forEach(l => {
            this.container && this.container.addLayer(l);
        });

        this.props.onWidgetResize(() => {
            this.container && this.container.reInitCanvasSize(this.props.options.width);
        })
    }

    render() {
        return <canvas ref={ref => this.ref = ref || undefined} onWheel={e => e.preventDefault()}></canvas>
    }

}
