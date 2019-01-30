import { FileResourceResolver } from '@theia/filesystem/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { TimelineChart } from 'timeline-chart/lib/time-graph-model';

export type Log = { code: Code[], ticks: Ticks[] }
export type Ticks = { tm: number, vm: number, s: number[] };
export type Code = { name: string, type: string, func?: number, kind?: string, tm?: number };
export type Stacks = Array<number[]>;
export type Names = string[];

export class ProfileDataProvider {

    constructor(protected uri: string, protected readonly resourceResolver: FileResourceResolver) {
    }

    async getData(): Promise<TimelineChart.TimeGraphModel> {
        const uri = new URI(this.uri).withScheme('file');
        const resource = await this.resourceResolver.resolve(uri);
        const content = await resource.readContents();
        const json:TimelineChart.TimeGraphModel = JSON.parse(content);
        if(!(json.arrows && json.rows && json.id && json.totalLength)){
            throw('The file needs a proper json format fitting the TimelineChart.TimeGraphModel interface.');
        }
        console.log(json);
        return json;
    }
}