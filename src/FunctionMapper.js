import { AStar } from "./Algorithms/Pathfinding/AStar.js"
import { Djikstra } from "./Algorithms/Pathfinding/Djikstra.js"
import { BubbleSort } from "./Algorithms/Sorting/BubbleSort.js"
import { SelectionSort } from "./Algorithms/Sorting/SelectionSort.js"
import { InsertionSort } from "./Algorithms/Sorting/InsertionSort.js"
import { QuickSort } from "./Algorithms/Sorting/QuickSort.js"
import { LinearSearch } from "./Algorithms/Searching/LinearSearch.js"
import { BinarySearch } from "./Algorithms/Searching/BinarySearch.js"
import { JPS } from "./Algorithms/Pathfinding/JPS.js"

class FunctionMapper {
    constructor() {
        this.AStar = AStar
        this.Djikstra = Djikstra
        this.BubbleSort = BubbleSort
        this.SelectionSort = SelectionSort
        this.InsertionSort = InsertionSort
        this.QuickSort = QuickSort
        this.LinearSearch = LinearSearch
        this.BinarySearch = BinarySearch
        this.JPS = JPS
    }

}

export { FunctionMapper }