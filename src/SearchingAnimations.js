import { Action } from "./Action.js"
import { AnimationController } from "./AnimationController.js"
import anime from "./anime.es.js"

class Comparison extends Action {
    constructor(targets, goal, options) {
        super(targets, options?.line || 1)
        Comparison.duration = 999  // duration of comparison at 1x speed
        this.speed = 1
        this.goal = goal
    }

    get duration() {    // duration of comparison based on speed
        return Comparison.duration / this.speed
    }

    get annotation() {
        //if(this.targets.length == 1) {
        //    return `This is the only element in the list`
        //}
        return `Checking if ${this.targets.value} is equal to ${this.goal.value}`
    }

    get animation() {
        //this.target = [this.targets[1]] // get singleton in array form
        //const animations = this.target.map((element) => {
        //    return {
        //        targets: document.querySelector(`${element.id}`),
        //        backgroundColor: "#84A98C",
        //        duration: this.duration
        //    }
        //})

        //return animations

        return {
            targets: document.querySelector(`${this.targets.id}`),
            backgroundColor: "#84A98C",
            duration: this.duration
        }
    }

    Animate(speed) {
        //this.speed = speed || this.speed
        return super.Animate.call(this, speed)
    }

    AddToTimeline(tl) {
        this.animation.forEach((animation, index) => {
            if(index == 0) {
                tl.add(animation)
            } else {
                tl.add(animation, `-=${this.duration}`)
            }
        })
    }
}

class Found extends Action {
    constructor(targets, options) {
        super(targets, options?.line || 2)
        Found.duration = 1
        this.speed = 1
    }

    get duration() {
        return Found.duration / this.speed
    }

    get annotation() {
        return `${this.targets.value} has been found.`
    }

    get animation() {
        //const animations = this.targets.map((element) => {
        //    return {
        //        targets: document.querySelector(`${element.id}`),
        //        backgroundColor: "#F26419", 
        //        duration: this.duration
        //    }
        //})
        //
        //return animations

        return {
            targets: document.querySelector(`${this.targets.id}`),
            backgroundColor: "#F26419", 
            duration: this.duration
        }
    }

    Animate(speed) {
        return super.Animate.call(this, speed)
    }

    AddToTimeline(tl) {
        this.animation.forEach((animation, index) => {
            if(index == 0) {
                tl.add(animation)
            } else {
                tl.add(animation, `-=${this.duration}`)
            }
        })
    }
}

class EliminateSingle extends Action {
    constructor(targets, goal, options) {
        super(targets, options?.line || 3)
        this.goal = goal
        EliminateSingle.duration = 1
        this.speed = 1
    }

    get duration() {
        return EliminateSingle.duration / this.speed
    }

    get annotation() {
        return `${this.goal.value} does not equal ${this.targets.value}`
    }

    get animation() {
        //const animations = this.targets.map((element) => {
        //    return {
        //        targets: document.querySelector(`${element.id}`),
        //        backgroundColor: "#696464",
        //        color: "#FFFFFF",
        //        duration: this.duration
        //    }
        //})
        //
        //return animations

        return {
            targets: document.querySelector(`${this.targets.id}`),
            backgroundColor: "#696464",
            color: "#FFFFFF",
            duration: this.duration
        }
    }

    Animate(speed) {
        return super.Animate.call(this, speed)
    }

    AddToTimeline(tl) {
        this.animation.forEach((animation, index) => {
            if(index == 0) {
                tl.add(animation)
            } else {
                tl.add(animation, `-=${this.duration}`)
            }
        })
    }
}

class EliminateLeft extends Action {
    constructor(targets, goal, options) {
        super(targets, options?.line || 4)
        this.goal = goal
        EliminateLeft.duration = 1
        this.speed = 1
    }

    get duration() {
        return EliminateLeft.duration / this.speed
    }

    get annotation() {
        console.log(this.targets)
        return `${this.goal.value} > ${this.targets[this.targets.length - 1].value}<br>
        ${this.goal.value} is in the right side.<br>
        Elimitate the left side.<br>`
    }

    get animation() {
        const animations = this.targets.map((element) => {
            return {
                targets: document.querySelector(`${element.id}`),
                backgroundColor: "#696464",
                color: "#FFFFFF",
                duration: this.duration
            }
        })

        return animations
    }

    Animate(speed) {
        this.speed = speed || this.speed
        const animList = []
        for(let anim of this.animation) {
            animList.push(anime(anim))
        }
        return {
            animations: animList,
            finished: Promise.all(animList.map((element) => {
                return element.finished
            })),
            pause: function() {
                this.animations.forEach((animation) => {animation.pause()})
            },
            play: function() {
                this.animations.forEach((animation) => {animation.play()})
            }
        }
    }

    AddToTimeline(tl) {
        this.animation.forEach((animation, index) => {
            if(index == 0) {
                tl.add(animation)
            } else {
                tl.add(animation, `-=${this.duration}`)
            }
        })
    }
}

class EliminateRight extends Action {
    constructor(targets, goal, line = 5) {
        super(targets, line)
        this.goal = goal
        EliminateRight.duration = 1
        this.speed = 1
    }

    get duration() {
        return EliminateRight.duration / this.speed
    }

    get annotation() {
        return `${this.goal.value} < ${this.targets[this.targets.length - 1].value}<br>
        ${this.goal.value} is in the left side.<br>
        Elimitate the right side.<br>`
    }

    get animation() {
        const animations = this.targets.map((element) => {
            return {
                targets: document.querySelector(`${element.id}`),
                backgroundColor: "#696464",
                color: "#FFFFFF",
                duration: this.duration
            }
        })

        return animations
    }

    Animate(speed) {
        this.speed = speed || this.speed
        const animList = []
        for(let anim of this.animation) {
            animList.push(anime(anim))
        }
        return {
            animations: animList,
            finished: Promise.all(animList.map((element) => {
                return element.finished
            })),
            pause: function() {
                this.animations.forEach((animation) => {animation.pause()})
            },
            play: function() {
                this.animations.forEach((animation) => {animation.play()})
            }
        }
    }

    AddToTimeline(tl) {
        this.animation.forEach((animation, index) => {
            if(index == 0) {
                tl.add(animation)
            } else {
                tl.add(animation, `-=${this.duration}`)
            }
        })
    }
}

export { Comparison, Found, EliminateSingle, EliminateLeft, EliminateRight }