const COLOR_MAP = {

    y: 0,
    o: 1,
    b: 2,
    r: 3,
    g: 4,
    w: 5,
    h: 255,

    0: 'y',
    1: 'o',
    2: 'b',
    3: 'r',
    4: 'g',
    5: 'w',
    255: 'h',

}

export class AnyColorTable {
    constructor(step: number) {
        this.step = step;
        this.colorTable = new Array<Array<string>>();
        for (let i = 0; i < 6; i++) {
            this.colorTable.push(new Array<string>(this.step * this.step).fill('h'));
        }
    }
    private step: number;
    private colorTable: Array<Array<string>>;

    public static fromMatrix(step: number, matrix: Array<Array<number>>) {
        const colorTable = new AnyColorTable(step)
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < step * step; j++) {
                colorTable.SetColor(i, j, COLOR_MAP[matrix[i][j]])
            }
        }
        return colorTable
    }

    public toMatrix(): Array<Array<number>> {
        const res = []
        for (let i = 0; i < 6; i++) {
            res.push(new Array<string>(this.step * this.step).fill('h'));
        }
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.step * this.step; j++) {
                res[i][j] = COLOR_MAP[this.GetColor(i, j)]
            }
        }
        return res
    }

    public SetColor(sideIndex: number, faceIndex: number, color: string) {
        this.colorTable[sideIndex][faceIndex] = color;
    }

    public GetColor(sideIndex: number, faceIndex: number): string {
        return this.colorTable[sideIndex][faceIndex];
    }
}
