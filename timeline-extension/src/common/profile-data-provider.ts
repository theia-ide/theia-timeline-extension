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

    async getData(range: TimelineChart.TimeGraphRange): Promise<TimelineChart.TimeGraphModel> {
        const uri = new URI(this.uri).withScheme('file');
        const resource = await this.resourceResolver.resolve(uri);
        const content = await resource.readContents();
        const json: TimelineChart.TimeGraphModel = JSON.parse(content);
        // const model: TimelineChart.TimeGraphModel = {
        //     arrows: [],
        //     rows: [],
        //     id: json.id,
        //     totalLength: json.totalLength
        // };
        // console.log("getData", range);
        // json.rows.forEach(row => {
        //     if ((row.range.start >= range.start && row.range.start <= range.end) ||
        //         (row.range.end >= range.start && row.range.end <= range.end) ||
        //         (row.range.start >= range.start && row.range.end >= range.end)) {
        //         const states: TimelineChart.TimeGraphRowElementModel[] = [];
        //         row.states.forEach(state => {
        //             if ((state.range.start >= range.start && state.range.start <= range.end) ||
        //                 (state.range.end >= range.start && state.range.end <= range.end) ||
        //                 (state.range.start >= range.start && state.range.end >= range.end)) {
        //                 states.push(state);
        //             }
        //         });
        //         row.states = states;
        //         model.rows.push(row);
        //     }
        // });
        // console.log("MODEL", model.rows.length, model.rows);
        if (!(json.arrows && json.rows && json.id && json.totalLength)) {
            throw ('The file needs a proper json format fitting the TimelineChart.TimeGraphModel interface.');
        }
        return json;
    }
}