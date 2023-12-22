import { Swap, Comparison, Sorted, PivotToggle, Subarray } from "../../SortingAnimations.js"
import Timeline from "../../Timeline.js";

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

export function BubbleSort(arr) {
    const timeline = Timeline()
    for(let i = 0; i < arr.length - 1; i++) {
        for(let j = 0; j < arr.length - i - 1; j++) {
            Comparison.AddToTimeline(timeline, {
                target: [arr[j].id, arr[j+1].id],
                highlight: {
                    target: document.querySelector("#pseudo1"),
                },
            })
            if(arr[j].value > arr[j + 1].value) {
                // swap
                Swap.AddToTimeline(timeline, {
                    target: [arr[j].id, arr[j+1].id], 
                    highlight: {
                        target: document.querySelector("#pseudo2"),
                }})
                swap(arr, j, j + 1)
            }
        }
    }
    return timeline
}