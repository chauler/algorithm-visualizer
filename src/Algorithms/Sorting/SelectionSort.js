import { Swap, Comparison, Sorted, PivotToggle, Subarray } from "../../SortingAnimations.js"
import Timeline from "../../Timeline.js";

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

export function SelectionSort(arr) {
    let min_ind
    const timeline = Timeline()

    for(let i = 0; i < (arr.length - 1); i++) {
        min_ind = i
        
        for(let j = i + 1; j < arr.length; j++) {
            // actions.push(new Comparison([arr[j], arr[min_ind]]))
            Comparison.AddToTimeline(timeline, {
                target: [arr[j]?.id, arr[min_ind].id],
                highlight: {target: document.querySelector("#pseudo1")},
            })
            if(arr[j].value < arr[min_ind].value) {
                min_ind = j
            }
        }
        // swap
        // actions.push(new Swap([arr[min_ind], arr[i]]))
        Swap.AddToTimeline(timeline, {
            target: [arr[min_ind].id, arr[i]?.id],
            highlight: {target: document.querySelector("#pseudo2")},
        })
        swap(arr, min_ind, i)
    }
    return timeline
}