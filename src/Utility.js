export function debounce(func, wait, immediate) {
	var timeout
	return function() {
		var context = this, args = arguments
		var later = function() {
			timeout = null
			if (!immediate) func.apply(context, args)
		};
		var callNow = immediate && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func.apply(context, args)
	}
}

export function insertUrlParam(key, value) {
	if (history.pushState) {
		let searchParams = new URLSearchParams(window.location.search);
		searchParams.set(key, value);
		let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
		window.history.replaceState({path: newurl}, '', newurl);
	}
}

// to remove the specific key
export function removeUrlParameter(paramKey) {
	const url = window.location.href
	console.log("url", url)
	var r = new URL(url)
	r.searchParams.delete(paramKey)
	const newUrl = r.href
	console.log("r.href", newUrl)
	window.history.replaceState({ path: newUrl }, '', newUrl)
}