import Cookies from "./js.cookie.min.mjs"

export function CheckFirstVisit(pageName) {
    if(!Cookies.get(pageName)) {
        $('#introModal').modal('show')
        Cookies.set(pageName, '1', {expires: 999})
    }
}

export class PathfindingCookies {
    static SetCellSize(size) {
        Cookies.set('cellSize', `${size}`, {expires: 999, sameSite: 'strict'})
    }
    static GetCellSize() {
        if(!Cookies.get('cellSize')) {
            this.SetCellSize(30)
        }
        return Number(Cookies.get('cellSize'))
    }
}