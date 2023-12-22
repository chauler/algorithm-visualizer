import { Action } from "./Action.js"
import { AnimationController } from "./AnimationController.js"
import Timeline from "./Timeline.js"
import anime from "./anime.es.js"
import { gsap } from "./gsap-core.js"
import { Alert } from "./Alert.js"

export class Swap extends Action {
    static duration = 1
    constructor(targets, line=2) {
        super(targets, line)
        this.speed = 1
    }

    static CreateAnimation(params) {
        if(!params) return undefined
        if(params.target?.length < 2) return undefined
        const innerTL = gsap.timeline()

        const target1 = document.querySelector(`${params.target[0]}`)
        const target2 = document.querySelector(`${params.target[1]}`)
        //Convenience vars in order to not have to retrieve the value and convert to number several times
        const [originalPos1, originalPos2] = [Number(target1.style.getPropertyValue('--position')), Number(target2.style.getPropertyValue('--position'))]
        //Used to track the translation at the start of each tween
        let startingPos1, startingPos2, translation1, translation2

        //Very weird animation made necessary by how CSS positioning is done. We do all calculations for both bars in the first animation
        //to avoid any timing issues. We snapshot all necessary values and then immediately change to what they should be at the end of the animation.
        innerTL.to(target1, {
            keyframes: [
                {x: ()=>{
                    //Store the position of both bars at the start of the tween.
                    startingPos1 = originalPos1 + Number(target1.style.getPropertyValue('--translation'))
                    startingPos2 = originalPos2 + Number(target2.style.getPropertyValue('--translation'))
                    //Store both translations so that we can update the DOM for future animations to avoid weird behavior when seeking fast
                    translation1 = startingPos2 - target1.style.getPropertyValue('--position')
                    translation2 = startingPos1 - target2.style.getPropertyValue('--position')
                    target1.style.setProperty('--translation', translation1)
                    target2.style.setProperty('--translation', translation2)
                    //And this is the actual value we want to animate to -
                    //bar1 started at 100px but is currently at 700px, bar 2 is at 800px
                    //This means bar1 already has a translation of 600px, we want to animate to 700px
                    return startingPos2-originalPos1
                }, duration: Swap.duration},
            ],
            ease: "expo.out", 
        })
        innerTL.to(target2, {
            keyframes: [
                {x: ()=>{return startingPos1-originalPos2}, duration: Swap.duration},
            ],
            ease: "expo.out", 
        }, "<")

        return innerTL
    }

    //TODO: Add annotation param that takes in an activate and deactivate tween. These will be inserted before and after
    //the actual sorting animation.
    static AddToTimeline(tl, params) {

        const mainAnimation = this.CreateAnimation(params)
        if(!mainAnimation) {
            console.log("Error creating Swap animation")
            return
        }
        tl.add(mainAnimation)
        if(params.highlight !== undefined) {
            Action.InsertHighlight(tl, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }
        //Check for user-provided annotations and highlights and apply their activation and deactivation animations at the beginning and end
        

    }

}

export class Comparison extends Action {
    static duration = 0.5
    constructor (targets, line=1) {
        super(targets.filter(obj => typeof obj !== "undefined"), line)
        this.speed = 1
    }

    static AddToTimeline(tl, params) {
        params.target = params.target.filter(x => x !== undefined)
        .map((e)=>document.querySelector(e).firstElementChild) //This targets the visual bar itself and not the entire container
        
        tl.to(params.target, {
            backgroundColor: "#228C22",
            duration: Comparison.duration,
            yoyo: true,
            repeat: 1
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(tl, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }
    }

}

export class Sorted extends Action {
    static duration = 0
    constructor(targets, line=3) {
        super(targets, line)
        this.speed = 1
    }

    static AddToTimeline(tl, params) {
        params.target = params.target.map((e)=>document.querySelector(e).firstElementChild)
        
        tl.set(params.target, {
            backgroundColor: "#FFA500"
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(tl, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }
        
    }
}

export class PivotToggle extends Action {
    static duration = 0
    constructor(targets, line=1) {
        super(targets, line)
        this.speed = 1
    }

    static AddToTimeline(tl, params) {
        const targetElement = document.querySelector(params.target).firstElementChild

        tl.to(targetElement, {
            backgroundColor: ()=>targetElement.style.backgroundColor !== "rgb(160, 32, 240)" ? "#A020F0" : "#6290C8", //Style computed at animation execution time.
            duration: PivotToggle.duration
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(tl, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }
    }
}

export class Subarray extends Action {
    static duration = 0
    constructor(targets, line=1) {
        super(targets, line)
        this.speed = 1
    }

    static AddToTimeline(tl, params) {
        params.target = params.target.map((e)=>document.querySelector(e).firstElementChild)

        tl.to(params.target, {
            backgroundColor: (index, target)=>{
                return target.style.backgroundColor !== "rgb(246, 143, 88)" ? "#f68f58" : "#6290C8"
            },
            duration: 0,
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(tl, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }
    }

}
