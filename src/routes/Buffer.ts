import { buffer, currentEvent, requestSource, requestNumber } from './store.js';
import type { Source } from './Source';

export class BufferElem {
    private sourceNumber: number = 0;
    private number: number = 0;
    private status: string = 'free';
    private timeOfPasting: number = 0;

    getStatus(): string {
        return this.status;
    }

    getSourceNumber(): number {
        return this.sourceNumber;
    }

    getNumber(): number {
        return this.number;
    }

    getTimeOfPasting(): number {
        return this.timeOfPasting;
    }

    setRequest(sourceNumber: number, number: number, timeOfPasting: number) {
        this.sourceNumber = sourceNumber;
        this.number = number;
        this.status = 'busy';
        this.timeOfPasting = timeOfPasting;
    }

    getRequest() {
        this.sourceNumber = 0;
        this.number = 0;
        this.status = 'free';
        this.timeOfPasting = 0.0;
    }
}

export class Buffer {
    private elements: BufferElem[] = [];

    constructor(size: number) {
        for (let index = 0; index < size; index++) {
            this.elements.push(new BufferElem);
        }
    }

    getContent(){
        return this.elements;
    }

    hasBusyElements(): boolean {
        for (let index = 0; index < this.elements.length; index++) {
            if (this.elements.at(index).getStatus() == 'busy') {
                return true;
            }
        }
        return false;
    }

    hasFreeElements(): boolean {
        for (let index = 0; index < this.elements.length; index++) {
            if (this.elements.at(index).getStatus() == 'free') {
                return true;
            }
        }
        return false;
    }

    setRequestOrDoResuse(sourceNumber: number, number: number, timeOfPasting: number, sources: Source[]) {
        if (!this.hasFreeElements()) {////в буфере нет свободных мест
            for (let index = 0; index < sources.length; index++) {///находим источник заявки и помечаем в нем отказ
                if (sources.at(index).getNumber() == sourceNumber) {
                    sources[index].refuseRequest();
                }
            }
            currentEvent.set("Заявке от источника " + sourceNumber + " с порядковый номером " + number + " было отказано в обслуживании");
        }
        else {
            let minimalInd = 0;
            for (let index = 0; index < this.elements.length; index++) {
                if (this.elements.at(index).getStatus() == 'free') {///находим первый свободный элемент
                    minimalInd = index;
                    break;
                }
            }
            this.elements.at(minimalInd).setRequest(sourceNumber, number, timeOfPasting);///ставим заявку на элемент буфера
            currentEvent.set("Заявка от источника " + sourceNumber + " с порядковый номером " + number + " поставлена на "+Number(Number(minimalInd)+Number(1))+" элемент буфера");
        }
        ////buffer.set(this);
    }

    getRequest(sources: Source[], requests_amount: number, currentTime_: number) {
        let elemIndex = -1;
        let minimalSource = sources.length + 1;
        let minimalRequest = requests_amount + 1;
        for (let index = 0; index < this.elements.length; index++) {////находим занятую ячейку с источником минимального номера
            if ((this.elements.at(index).getSourceNumber() < minimalSource) && (this.elements.at(index).getStatus() == 'busy')) {
                minimalSource = this.elements.at(index).getSourceNumber();
            }
        }
        for (let index = 0; index < this.elements.length; index++) {///находим минимальный номер заявки у источника с минимальным номером
            if (this.elements.at(index).getSourceNumber() == minimalSource) {
                if (this.elements.at(index).getNumber() < minimalRequest) {
                    minimalRequest = this.elements.at(index).getNumber();
                    elemIndex = index;
                }
            }
        }
        for (let index = 0; index < sources.length; index++) {///изменяем у соответствующего источника время нахождения заявок в буфере
            if (sources.at(index).getNumber() == minimalSource) {
                let newBufferTime = Number(Number(currentTime_)-Number(this.elements.at(elemIndex).getTimeOfPasting()))
                sources.at(index).updateBufferTime(newBufferTime);///время нахождения в буфере - текущее-время постановки
                // console.log(newBufferTime);
            }
        }

        this.elements.at(elemIndex).getRequest();///освобождаем ячейку буфера
        currentEvent.set("Заявка " + minimalRequest + " от источника " + minimalSource + " взята из буфера");

        requestSource.set(minimalSource);
        requestNumber.set(minimalRequest);

        // buffer.set(this);
    }
}
