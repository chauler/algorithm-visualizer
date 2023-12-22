import { Swap, Comparison, Sorted, PivotToggle, Subarray } from "../../SortingAnimations.js"
import Timeline from "../../Timeline.js";

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

export function InsertionSort(arr) {
    let j, current, i
    const timeline = Timeline()
    for(i = 1; i < arr.length; i++) {
        current = arr[i]
        j = i - 1
        Sorted.AddToTimeline(timeline, {target: [arr[j]?.id]})
        Comparison.AddToTimeline(timeline, {
            target: [arr[j]?.id, current.id],
            highlight: {target: document.querySelector("#pseudo1")},
        })
        while(j >= 0 && arr[j].value > current.value) { // checks if j is outside of array and compares j position value with current
            Swap.AddToTimeline(timeline, {
                target: [current.id, arr[j]?.id],
                highlight: {target: document.querySelector("#pseudo2")},
            })

            arr[j + 1] = arr[j]
            j--

            Comparison.AddToTimeline(timeline, {
                target: [arr[j]?.id, current.id],
                highlight: {target: document.querySelector("#pseudo1")},
            })
        }
        arr[j + 1] = current   // once while is false, the last j position is current
        Sorted.AddToTimeline(timeline, {
            target: [current.id],
            highlight: {target: document.querySelector("#pseudo3")},
        },)
    }
    return timeline
}