import { default as anime } from "./anime.es.js"

class Action {
    constructor(targets, line) {
        this.targets = targets
        this.line = `#pseudo${line}`
        this.speed = 1
    }

    //Highlight object needs activate and deactive animation objects
    static InsertHighlight(timeline, {target, duration}) {
        if(target === null) return
        timeline.to(target, {
            backgroundColor: "#000000",
            color: "#FFFFFF",
            duration: duration/2,
            yoyo: true,
            repeat: 1,
            onComplete: ()=>{target.style = ""},
        }, "<")

    }

    static InsertAnnotation(timeline, annotation) {
        if(annotation.active === undefined || annotation.deactive === undefined) {
            console.log("Error creating annotation animation")
            return
        }

        
    }

    AnimatePseudocode(speed) {
        this.speed = speed || this.speed
        return anime({
            targets: this.line,
            backgroundColor: [{value: "#000000", duration: this.duration-1},
                {value: anime.get(document.querySelector(`${this.line}`), "backgroundColor"), duration: 1}],
            color: [{value: "#FFFFFF", duration: this.duration-1},
                {value: anime.get(document.querySelector(`${this.line}`), "color"), duration: 1}]
        })
    }
}

export { Action }