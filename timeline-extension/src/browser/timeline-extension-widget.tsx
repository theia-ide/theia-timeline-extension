import { ReactWidget } from "@theia/core/lib/browser";
import { injectable, inject } from "inversify";
import * as React from 'react';
import { FileResourceResolver } from "@theia/filesystem/lib/browser";
import { TimeGraphView } from "./timegraph-view";
import { TimeGraphRowElement } from "timeline-chart/lib/components/time-graph-row-element";

export const TimelineExtensionWidgetOptions = Symbol('TimelineExtensionWidgetOptions');
export interface TimelineExtensionWidgetOptions {
    profileURI: string
}

@injectable()
export class TimelineExtensionWidget extends ReactWidget {

    static ID = 'node-prof-widget';
    static LABEL = 'Node Prof';

    protected timeGraphView: TimeGraphView;

    protected selected?: TimeGraphRowElement;
    protected hovered?: TimeGraphRowElement;

    constructor(
        @inject(TimelineExtensionWidgetOptions) protected readonly options: TimelineExtensionWidgetOptions,
        @inject(FileResourceResolver) protected readonly resourceResolver: FileResourceResolver) {
        super();

        this.id = 'theia-node-prof-timeline';
        this.title.label = 'Node Profiler Timeline';
        this.title.closable = true;

        this.timeGraphView = new TimeGraphView(this.options.profileURI, this.resourceResolver, {
            selectionHandler: (el: TimeGraphRowElement) => { this.selected = el; this.update(); },
            mouseOverHandler: (el: TimeGraphRowElement) => { this.hovered = el; this.update(); },
            mouseOutHandler: (el: TimeGraphRowElement) => { this.hovered = undefined; this.update(); },
            updateHandler: () => { this.update(); }
        });

        this.update();
    }

    protected render(): React.ReactNode {
        return <React.Fragment>
            <div id='timegraph-main' className='ps__child--consume' onWheel={ev => { ev.preventDefault(); ev.stopPropagation(); }}>
                {this.timeGraphView.renderTimeGraphChart()}
            </div>
            <div className='info-container'>
                <div className='selectedElement info'>
                    <div className='info-header'>Selected Element</div>
                    <div>{this.selected && this.selected.model.label}</div>
                </div>
                <div className='hoveredElement info'>
                    <div className='info-header'>Hovered Element</div>
                    {this.hovered && this.hovered.model.label}
                </div>
            </div>
        </React.Fragment>
    }

    protected onResize() {
        this.timeGraphView.onWidgetResize();
    }
}