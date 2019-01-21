/**
 * Generated using theia-extension-generator
 */

import { TimelineExtensionCommandContribution, TimelineExtensionMenuContribution } from './timeline-extension-contribution';
import {
    CommandContribution,
    MenuContribution
} from "@theia/core/lib/common";

import { ContainerModule } from "inversify";

export default new ContainerModule(bind => {
    // add your contribution bindings here
    
    bind(CommandContribution).to(TimelineExtensionCommandContribution);
    bind(MenuContribution).to(TimelineExtensionMenuContribution);
    
});