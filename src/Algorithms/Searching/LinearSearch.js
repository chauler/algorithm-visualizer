import { Comparison, Found, EliminateSingle, EliminateLeft, EliminateRight } from "../../SearchingAnimations.js"

export function LinearSearch(arr, x) {
    const actions = []
    for (let i = 0; i < arr.length; i++) {
        actions.push(new Comparison(arr[i], x))
        if(arr[i].value == x.value) {
            console.log("found")
            actions.push(new Found(arr[i]))
            return actions
        }
        actions.push(new EliminateSingle(arr[i], x))
    }
    console.log("not found");
    return actions
}