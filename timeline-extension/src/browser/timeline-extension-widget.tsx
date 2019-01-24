import { ReactWidget } from "@theia/core/lib/browser";
import { injectable, inject } from "inversify";
import * as React from 'react';
import { ProfileDataProvider } from "../common/profile-data-provider";
import { FileResourceResolver } from "@theia/filesystem/lib/browser";

export const TimelineExtensionWidgetOptions = Symbol('TimelineExtensionWidgetOptions');
export interface TimelineExtensionWidgetOptions {
    profileURI: string
}

@injectable()
export class TimelineExtensionWidget extends ReactWidget {

    static ID = 'node-prof-widget';
    static LABEL = 'Node Prof';

    protected provider: ProfileDataProvider;

    constructor(
        @inject(TimelineExtensionWidgetOptions) protected readonly options: TimelineExtensionWidgetOptions,
        @inject(FileResourceResolver) protected readonly resourceResolver: FileResourceResolver) {
        super();

        this.id = 'theia-node-prof-timeline';
        this.title.label = 'Node Profiler Timeline';
        this.title.closable = true;

        this.provider = new ProfileDataProvider(options.profileURI, resourceResolver);
        this.provider.getData();
        this.update();
    }

    protected render(): React.ReactNode {

        return <div>HELLO</div>
    }

}