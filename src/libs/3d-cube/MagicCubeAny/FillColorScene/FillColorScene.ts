import { AnyFillColorScene } from './AnyFillColorScene';
import { SecondFillColorScene } from './SpecificFillColorScene/SecondFillColorScene';
import { ThirdFillColorScene } from './SpecificFillColorScene/ThirdFillColorScene';
import { ColorOptions } from '../../ColorOptions';
import { Assets } from '../../Assets';
import { Debug } from '../../Util/Debug';
import { AnyColorTable } from '../ColorRef/AnyColorTable';

export class FillColorScene {
    private anyFillColorScene: AnyFillColorScene;
    constructor(container: Element, step: number, assets: Assets) {
        switch (step) {
            case 2:
                this.anyFillColorScene = new SecondFillColorScene(container, assets);
                break;
            case 3:
                this.anyFillColorScene = new ThirdFillColorScene(container, assets);
                break;
        }
    }

    public SetColorOption(option: ColorOptions) {
        this.anyFillColorScene.SetColorOption(option);
    }

    public GetAllColor(): AnyColorTable {
        return this.anyFillColorScene.GetColorTable();
    }

    public GetColorRemain() {
        return this.anyFillColorScene.GetColorRemain()
    }

    public resize(width, height) {
        this.anyFillColorScene.resize(width, height);
    }

    public dispose() {

    }

    public RenderEnable() {
        this.anyFillColorScene.RenderEnable();
    }

    public NextSide() {
        this.anyFillColorScene.NextSide();
    }

    public PreSide() {
        this.anyFillColorScene.PreSide();
    }
}
