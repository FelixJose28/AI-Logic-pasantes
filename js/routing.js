// redirect to a route in the page 
function redirectToRoute(route) {
    location.assign(`${location.origin}/AI-Logic-pasantes/views/${route}`);
}

window.addEventListener("hashchange", () => {
    let routeHash = window.location.hash;
    console.log(`New route hash: ${routeHash}`);

    if (routeHash.length > 0) {
        let route = routeHash.substr(1);

        if (route.length == 0) {
            // Redirect to homepage
        } else {
            location.assign(`${location.origin}/views/${route}`);
        }
    }
});