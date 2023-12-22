//Singleton class used to manage the input values along with their retreiving and
//updating. All UI events should use this class's methods to interact with the array.
export class Input {
    static s_instance = undefined;
    static s_inputElement = document.querySelector("#input");
    constructor() {
        this.input = []
    }

    static GetInstance() {
        if (this.s_instance === undefined) {
            this.s_instance = new Input;
        }
        return this.s_instance;
    }

    UpdateInputBox() {
        Input.s_inputElement.value = this.input.map(e=>e.value)
    }

    GetInput() {
        return this.input.slice()
    }

    AddNumber(num) {
        const element = {
            value: num,
            id: `#arrBar${i}`
        }
        this.input.push(element)
        this.UpdateInputBox()
    }

    RemoveNumber(num) {
        let index;
        if(typeof num === 'number') {
            index = this.input.findIndex((e)=>e.value === num)
        }
        else if (typeof num === 'string') {
            index = this.input.findIndex((e) => e.id === num)
        }

        if(typeof index === 'undefined' || index == -1) {
            return;
        }
        this.input.splice(index, 1)
        this.UpdateInputBox()
    }

    /*
    Takes an array of numbers, sets input member to an array of objects mapping numbers to bar IDs
    Also updates the input box in case this function was called from elsewhere (random input button)
    */
    SetInput(arr) {
        this.input = arr.map((val, i) => {
            if(Number.isNaN(Number(val))) {
                throw new Error("Something went wrong with the input - check to make sure you put all necessary commas and only inserted numbers.")
            }
            return {
            value: Number(val),
            id: `#arrBar${i}`
            }})
        this.UpdateInputBox()
    }

}
