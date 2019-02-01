import { ReactWidget } from "@theia/core/lib/browser";
import { injectable, inject } from "inversify";
import * as React from 'react';
import { FileResourceResolver } from "@theia/filesystem/lib/browser";
import { TimeGraphView } from "./timegraph-view";

export const TimelineExtensionWidgetOptions = Symbol('TimelineExtensionWidgetOptions');
export interface TimelineExtensionWidgetOptions {
    profileURI: string
}

@injectable()
export class TimelineExtensionWidget extends ReactWidget {

    static ID = 'node-prof-widget';
    static LABEL = 'Node Prof';

    protected timeGraphView: TimeGraphView;

    constructor(
        @inject(TimelineExtensionWidgetOptions) protected readonly options: TimelineExtensionWidgetOptions,
        @inject(FileResourceResolver) protected readonly resourceResolver: FileResourceResolver) {
        super();

        this.id = 'theia-node-prof-timeline';
        this.title.label = 'Node Profiler Timeline';
        this.title.closable = true;

        this.timeGraphView = new TimeGraphView(this.options.profileURI, this.resourceResolver, ()=>{
            this.update();
        });

        this.update();
    }

    protected render(): React.ReactNode {

        return <div id='timegraph-main' className='ps__child--consume' onWheel={ev=>{ev.preventDefault(); ev.stopPropagation();}}>
            {this.timeGraphView.renderTimeGraphChart()}
        </div>
    }

    protected onResize(){
        this.timeGraphView.onWidgetResize();
    }
}