function createArticles(data) {
    const newArticle = document.createElement("article");
    newArticle.classList.add("p-4", "rounded-lg", "w-full", `bg_${data[3]}`, "flex", "flex-col");
    // I probably just dont know how to use sql, but sql is evil and gave the data in arrays without keys, so sorry if the indexing looks a bit unreedable
    // 0: id, 1: title, 2: description 3: color 4: location 5: start time
    newArticle.dataset.rId = parseInt(data[0]);
    newArticle.innerHTML = `<h3 class="text-2xl font-bold">${data[1]}</h3>
<p><span class="font-bold">Start Time: </span>${data[5]}</p>
<p><span class="font-bold">Location: </span>${data[4]}</p>
<p class="mt-2 line-clamp-4 grow">${data[2]}</p>
<div class="flex"><a href="javascript:void(0)" onclick="viewDetails(this)" class="flex items-center justify-center bg-blue-200 dark:bg-sky-600 text-gray-900 dark:text-white rounded-md w-1/2 py-1">See whole summary</a></div>`;
    document.getElementById("events").append(newArticle);
}

function viewDetails(anchor) {
    // Remove line clamp, and change button.
    anchor.parentElement.parentElement.children[3].classList.remove("line-clamp-4");
    anchor.innerHTML = "Close Summary";
    anchor.classList.remove("bg-blue-200", "dark:bg-sky-600");
    anchor.classList.add("bg-red-200", "dark:bg-rose-600");
    anchor.setAttribute("onclick", "closeDetails(this)");
    // Add edit button
    const editButton = document.createElement("a");
    editButton.href = `form.html?type=event&id=${anchor.parentElement.parentElement.dataset.rId}`;
    editButton.classList.add("flex", "items-center", "justify-center", "bg-yellow-200", "dark:bg-amber-600", "text-gray-900", "dark:text-white", "rounded-md", "ml-auto", "w-1/4", "py-1");
    editButton.innerHTML = "Edit";
    editButton.title = "Requires password!!";
    anchor.parentElement.append(editButton);
}
function closeDetails(anchor) {
    // Re-add the line clamp and revert button
    anchor.parentElement.parentElement.children[3].classList.add("line-clamp-4");
    anchor.innerHTML = "See whole summary";
    anchor.classList.remove("bg-red-200", "dark:bg-rose-600");
    anchor.classList.add("bg-blue-200", "dark:bg-sky-600");
    anchor.setAttribute("onclick", "viewDetails(this)");
    // Remove edit button
    anchor.parentElement.children[1].remove()
}

function createEntires(data) {
    for (eventItem of data) {
        createArticles(eventItem)
    }
}

let ws = new WebSocket("ws://localhost:8764");

ws.addEventListener("error", (e) => {
    console.log("uh oh error, we need a better way of displaying this maybe")
});
ws.addEventListener("open", () => {
    ws.send(JSON.stringify({"request" : "get_events"}))
});
ws.addEventListener("message", (e) => {
    createEntires(JSON.parse(e.data))
});