import { injectable } from 'inversify';
import { Command, CommandRegistry, CommandContribution } from '@theia/core';
import { WidgetOpenHandler } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { TimelineExtensionWidget, TimelineExtensionWidgetOptions } from './timeline-extension-widget';

export namespace TimelineExtensionCommands {
    export const OPEN: Command = {
        id: 'timeline:open',
        label: 'Open Timeline'
    };
}

@injectable()
export class TimelineExtensionContribution extends WidgetOpenHandler<TimelineExtensionWidget> implements CommandContribution {
    protected createWidgetOptions(uri: URI): TimelineExtensionWidgetOptions {
        return {
            profileURI: uri.path.toString()
        };
    }

    readonly id = TimelineExtensionWidget.ID;
    readonly label = 'Open Timeline';

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(TimelineExtensionCommands.OPEN);
    }

    canHandle(uri: URI): number {
        return 100;
    }
}
