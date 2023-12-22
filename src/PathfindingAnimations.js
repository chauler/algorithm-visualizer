import { Action } from "./Action.js"
import { AnimationController } from "./AnimationController.js"
import anime from "./anime.es.js"
import { gsap } from "./gsap-core.js"

export class FinalPath extends Action {
    static stagger = 0.2
    constructor(targets, line=2) {
        super(targets, line)
        this.speed = 1
    }

    static AddToTimeline(timeline, params) {
        //Calculate stagger for best experience. 200ms looks best imo, but takes too long to animate for long paths.
        //So default to 200ms stagger, but cap animation length at 5 seconds and reduce stagger length if it exceed that.
        let duration = this.stagger * params.target.length
        let stagger = this.stagger
        if(duration > 5) {
            duration = 5
            stagger = duration / params.target.length
        }

        timeline.to(params.target, {
            backgroundColor: "#FEDC97",
            stagger: stagger,
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(timeline, {target: params.highlight.target, duration: params.highlight.duration = duration})
        }

    }
}

export class SearchedPath extends Action {
    static duration = .6
    constructor(targets, childAnimation, line=1) {
        super(targets, line)
        this.speed = 1
    }

    static AddToTimeline(timeline, params) {
        timeline.to(params.target, {
            keyframes: [
                {backgroundColor: "#F26419", duration: 0},
                {backgroundColor: "#28666E", delay: SearchedPath.duration - 0.01, duration: 0.01},
            ],
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(timeline, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }

    }
}

export class NewChildren extends Action {
    static duration = 0
    constructor(targets, line=3) {
        super(targets, line)
        this.speed = 1
    }

    static AddToTimeline(timeline, params) {
        timeline.to(params.target, {
            backgroundColor: "#696464",
            duration: 0,
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(timeline, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }

    }
}

export class SkippedNode extends Action {
    static duration = 0.02

    static AddToTimeline(timeline, params) {
        timeline.to(params.target, {
            backgroundColor: "#808080F0",
            duration: SkippedNode.duration,
        })

        if(params.highlight !== undefined) {
            Action.InsertHighlight(timeline, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }

    }
}

export class JumpNode extends Action {
    static duration = 1

    // static AddToTimeline(timeline, params) {
    //     return timeline.to(params.target, {
    //         backgroundColor: "#00FF00A0",
    //         duration: SkippedNode.duration,
    //     })
    // }

    //This ATT method is unique in requiring a label parameter to determine where to position the jump node.
    static AddToTimeline(timeline, params) {
        const tween = gsap.to(params.target, {
            keyframes: [
                {backgroundColor: "#F26419", duration: 0},
                {backgroundColor: "#F26419", duration: JumpNode.duration},
            ], 
        })
        timeline.shiftChildren(JumpNode.duration, true, params.label)
        timeline.add(tween, params.label)

        if(params.highlight !== undefined) {
            Action.InsertHighlight(timeline, {target: params.highlight.target, duration: params.highlight.duration = this.duration})
        }

    }
}