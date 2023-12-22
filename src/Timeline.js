import { gsap } from "./gsap-core.js"
import { CSSPlugin } from "./CSSPlugin.js"
gsap.registerPlugin(CSSPlugin)

export default function Timeline(params) {
    let progressBar
    if(params?.trackProgress !== false) {
        //Explicit progress bar defined, assumes trackProgress to be true
        if(params?.progressBar) {
            progressBar = params.progressBar
        } 
        else {
            progressBar = document.querySelector("#Progress-Bar-Fill")
        }
    }
    return gsap.timeline({paused: true, onUpdate: progressBar ? function(){progressBar.style.width = `${this.progress()*100}%`} : undefined})
}
