import { Swap, Comparison, Sorted, PivotToggle, Subarray } from "../../SortingAnimations.js"
import Timeline from "../../Timeline.js";

function swap(arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

export function QuickSort(arr, low, high, timeline) {
    if(typeof timeline === "undefined") {
        timeline = Timeline()
    }
    if(low < high) {
        let pivot = Partition(arr, low, high, timeline)

        QuickSort(arr, low, pivot - 1, timeline)
        QuickSort(arr, pivot + 1, high, timeline)
    }
    return timeline
}

function Partition(arr, low, high, timeline) {
    let pivot = arr[high].value
    PivotToggle.AddToTimeline(timeline, {target: arr[high].id})
    Subarray.AddToTimeline(timeline, {target: arr.slice(low, high).map(x=>x.id)})
    let i = (low - 1)

    for (let j = low; j <= high - 1; j++) {
        Comparison.AddToTimeline(timeline, {
            target: [arr[j]?.id, arr[high]?.id],
            highlight: {target: document.querySelector("#pseudo1")},
        })
        if(arr[j].value < pivot) {
            i++
            Swap.AddToTimeline(timeline, {
                target: [arr[i]?.id, arr[j]?.id],
                highlight: {target: document.querySelector("#pseudo2")},
            })
            swap(arr, i, j)
        }   
    }
    Swap.AddToTimeline(timeline, {
        target: [arr[i+1]?.id, arr[high]?.id],
        highlight: {target: document.querySelector("#pseudo3")},
    })
    PivotToggle.AddToTimeline(timeline, {target: arr[high].id})
    Subarray.AddToTimeline(timeline, {target: arr.slice(low, high).map(x=>x.id)})
    swap(arr, i + 1, high)
    return (i + 1)
}