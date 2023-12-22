export class AnimationController {
    constructor(params) {
        this.speeds = params?.speeds || [1, 5, 10, 100]
        this.speed = params?.speed || this.speeds[0]
        this.timeline = params?.timeline || undefined
    }

    //Begin an animation timeline with the current speed
    PlayTimeline() {
        this.timeline.play().timeScale(this.speed)
        return this.timeline
    }

    //Resume the current animation.
    Play() {
        this.timeline.resume()
    }

    //Pause the current animation.
    Pause() {
        this.timeline.pause()
    }

    //Sets current speed. Applies it to timeline if present. New timelines will apply most recent speed on start.
    SetSpeed(speed) {
        this.speed = speed
        this.timeline?.timeScale(speed)
    }

    //Called when the timeline is stopped by the cancel button to handle cleanup.
    CancelTimeline() {
        this.timeline?.kill()
        this.timeline = undefined
    }

    //Interrupts the current timeline flow and resumes it at another point
    async SeekTimeline(percentage) {
        this.timeline.progress(percentage)
    }

    IsPlaying() {
        return this.timeline.isActive()
    }

    IsInProgress() {
        if(this.timeline?.progress() > 0 && this.timeline?.progress() < 1) {
            return true
        } else {
            return false
        }
    }
}
