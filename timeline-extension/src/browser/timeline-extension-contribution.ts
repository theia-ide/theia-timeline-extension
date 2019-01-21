import { injectable, inject } from "inversify";
import { CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from "@theia/core/lib/common";
import { CommonMenus } from "@theia/core/lib/browser";

export const TimelineExtensionCommand = {
    id: 'TimelineExtension.command',
    label: "Shows a message"
};

@injectable()
export class TimelineExtensionCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(TimelineExtensionCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
    }
}

@injectable()
export class TimelineExtensionMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: TimelineExtensionCommand.id,
            label: 'Say Hello'
        });
    }
}