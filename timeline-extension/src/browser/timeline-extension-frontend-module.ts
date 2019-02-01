/**
 * Generated using theia-extension-generator
 */


import { ContainerModule, Container } from "inversify";
import { TimelineExtensionWidget, TimelineExtensionWidgetOptions } from "./timeline-extension-widget";
import { WidgetFactory, OpenHandler } from "@theia/core/lib/browser";
import { TimelineExtensionContribution } from "./timeline-extension-contribution";

import '../../src/browser/style/index.css';

export default new ContainerModule(bind => {
    bind(TimelineExtensionWidget).toSelf();
    bind<WidgetFactory>(WidgetFactory).toDynamicValue(context => ({
        id: TimelineExtensionWidget.ID,
        createWidget(options: TimelineExtensionWidgetOptions): TimelineExtensionWidget {
            const child = new Container({ defaultScope: 'Singleton' });
            child.parent = context.container;
            child.bind(TimelineExtensionWidgetOptions).toConstantValue(options);
            return child.get(TimelineExtensionWidget);
        }
    }));

    bind(TimelineExtensionContribution).toSelf().inSingletonScope();
    bind(OpenHandler).toService(TimelineExtensionContribution);
});