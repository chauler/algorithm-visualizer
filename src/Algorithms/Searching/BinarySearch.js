import { Comparison, Found, EliminateSingle, EliminateLeft, EliminateRight } from "../../SearchingAnimations.js"

function getRangeToEliminate(arr, range, start, end) {
    range = []
    for(let i = start; i <= end; i++) {
        range.push(arr[i])
    }
    return range
}

export function BinarySearch(arr, x) {
    let left = 0
    let right = arr.length - 1
    let mid
    let range = []
    const actions = []
    while (left <= right) {
        mid = Math.floor(left + (right - left) / 2) // get mid value of subarray
        console.log(mid);
        actions.push(new Comparison(arr[mid], x))
        if(x.value == arr[mid].value) {
            actions.push(new Found(arr[mid]))
            return actions
        } else if(x.value > arr[mid].value) {   // x is on the right side
            range = getRangeToEliminate(arr, range, left, mid)
            actions.push(new EliminateLeft(range, x))
            left = mid + 1
        } else { // x is on the left side
            range = getRangeToEliminate(arr, range, mid, right)
            actions.push(new EliminateRight(range, x))
            right = mid - 1
        }
    }
    console.log("not found");
    return actions
}