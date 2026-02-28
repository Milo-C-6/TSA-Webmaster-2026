const entriesSection = document.getElementById("entriesSection"); 
const searchElem = document.getElementById("search");
const filterElem = document.getElementById("filter");
const ws = new WebSocket("ws://localhost:8764");
const entriesElems = [];
function createArticles(data) {
    const newArticle = document.createElement("article");
    newArticle.classList.add("p-4", "rounded-lg", "w-full", `bg_${data[3]}`, "flex", "flex-col", "list-none");
    // I probably just dont know how to use sql, but sql is evil and gave the data in arrays without keys, so sorry if the indexing looks a bit unreedable
    // 0: id, 1: title, 2: description 3: color 4: location 5: type
    newArticle.dataset.rId = parseInt(data[0]);
    newArticle.innerHTML = `<h3 class="text-2xl font-bold">${data[1]}</h3>
    <p class="font-bold capitalize">${data[5]}</p>
<p><span class="text-bold">Location:</span> ${data[4]}</p>
<p class="mt-2 line-clamp-4 grow">${data[2]}</p>
<div class="flex"><a href="javascript:void(0)" onclick="viewDetails(this)" class="flex items-center justify-center bg-blue-200 dark:bg-sky-600 text-gray-900 dark:text-white rounded-md w-full py-1">View Details</a></div>`;
    entriesSection.append(newArticle);
    entriesElems.push(newArticle);
}

function viewDetails(anchor) {
    const articleElem = anchor.parentElement.parentElement;
    const curSection = articleElem.parentElement;
    // Edit article
    articleElem.dataset.opened = true;
    articleElem.style.minHeight = "25vh";
    // Edit button
    anchor.classList.remove("bg-blue-200", "dark:bg-sky-600", "w-full");
    anchor.classList.add("bg-red-200", "dark:bg-rose-600", "w-1/2");
    anchor.innerHTML = "Close Details";
    anchor.setAttribute("onclick", "closeDetails(this)");
    // Add edit button
    const editButton = document.createElement("a")
    editButton.href = `form.html?type=resource&id=${articleElem.dataset.rId}`;
    editButton.classList.add("flex", "items-center", "justify-center", "bg-yellow-200", "dark:bg-amber-600", "text-gray-900", "dark:text-white", "rounded-md", "ml-auto", "w-1/2", "py-1");
    editButton.innerHTML = "Edit";
    editButton.title = "Requires password!!";
    anchor.parentElement.append(editButton);
    articleElem.children[3].classList.remove("line-clamp-4") // Make all text viewable.
    if (curSection.classList.contains("grid-cols-2")) {
        return;
    }
    // Move entries after this one to make this one wider
    let curChildren = Array.from(articleElem.parentElement.children);
    const afterSection = document.createElement("section");
    afterSection.classList.add("grid", "justify-center", "gap-4", "grid-cols-4");
    // Create a section containing the details plus a nearby item if width is big enough.
    const newSection = document.createElement("section");
    newSection.classList.add("grid", "justify-center", "gap-4", "my-2");

    let offSet = 1 
    if (innerWidth > 1024 && curChildren.indexOf(articleElem)+1 != curChildren.length) {
        newSection.classList.add("grid-cols-2")
        offSet = 2
        newSection.appendChild(curChildren[curChildren.indexOf(articleElem)+1])
    } else {
        newSection.classList.add("grid-cols-1")
    }
    newSection.prepend(articleElem)
    for (item of curChildren.slice(curChildren.indexOf(articleElem)+offSet)) {
        afterSection.appendChild(item);
    }
    curSection.insertAdjacentElement("afterend", afterSection);
    curSection.insertAdjacentElement("afterend", newSection);
}

function closeDetails(anchor) {
    const articleElem = anchor.parentElement.parentElement;
    const curSection = articleElem.parentElement;
    // Revert button
    anchor.classList.remove("bg-red-200", "dark:bg-rose-600", "w-1/2");
    anchor.classList.add("bg-blue-200", "dark:bg-sky-600", "w-full");
    anchor.innerHTML = "View Details";
    anchor.setAttribute("onclick", "viewDetails(this)");
    articleElem.children[3].classList.add("line-clamp-4"); // Reset line clamp
    anchor.parentElement.children[1].remove(); // Remove edit button
    // Revert ArcitleElem
    delete articleElem.dataset.opened;
    articleElem.style.minHeight = "inherit";
    // Check if theres an adjacent element opened, and we should not reset formating.
    if (curSection.children.length > 1 && (curSection.children[0].dataset.opened == "true" || curSection.children[1].dataset.opened == "true")) {
        return;
    }
    // Reset section formating
    const ogSection = curSection.previousSibling;
    while (curSection.children.length > 0) {
        ogSection.appendChild(curSection.children[0])
    }
    while (curSection.nextSibling.children.length > 0) {
        ogSection.appendChild(curSection.nextSibling.children[0])
    }
    curSection.nextSibling.remove();
    curSection.remove();
}

function searchEntires(query) {
    for (item of entriesElems) {
        if (item.children[0].innerHTML.includes(query) || item.children[3].innerHTML.includes(query)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    }
}

function setFilter(query) {
    for (item of entriesElems) {
        if (item.children[1].innerHTML.includes(query)) {
            item.style.display = "block";
        }  else {
            item.style.display = "none";
        }
    }
}

ws.addEventListener("error", (e) => {
    console.log("uh oh error, we need a better way of displaying this maybe")
});
ws.addEventListener("open", () => {
    ws.send(JSON.stringify({"request" : "get_resources"}))
});
ws.addEventListener("message", (e) => {
    for (resource of JSON.parse(e.data)) {
        createArticles(resource)
    }
});