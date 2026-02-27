function createArticles(data) {
    const newArticle = document.createElement("article");
    newArticle.classList.add("p-4", "rounded-lg", "w-full", `bg_${data[3]}`, "flex", "flex-col", "list-none");
    // I probably just dont know how to use sql, but sql is evil and gave the data in arrays without keys, so sorry if the indexing looks a bit unreedable
    // 0: id, 1: title, 2: description 3: color 4: location 5: type
    newArticle.dataset.rId = parseInt(data[0]);
    newArticle.innerHTML = `<h3 class="text-2xl font-bold">${data[1]}</h3>
<p><span class="text-bold">Location:</span> ${data[4]}</p>
<p class="mt-2 line-clamp-4 grow">${data[2]}</p>
<div class="flex"><a href="javascript:void(0)" onclick="viewDetails(this)" class="flex items-center justify-center bg-blue-200 dark:bg-sky-600 text-gray-900 dark:text-white rounded-md w-full py-1">View Details</a></div>`;
    document.getElementById(data[5]).append(newArticle);
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
    articleElem.children[2].classList.remove("line-clamp-4") // Make all text viewable.
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
    console.log(curSection)
    curSection.insertAdjacentElement("afterend", afterSection);
    curSection.insertAdjacentElement("afterend", newSection);
} // holy wall of text slop code

function closeDetails(anchor) {
    const articleElem = anchor.parentElement.parentElement;
    const curSection = articleElem.parentElement;
    // Revert button
    anchor.classList.remove("bg-red-200", "dark:bg-rose-600", "w-1/2");
    anchor.classList.add("bg-blue-200", "dark:bg-sky-600", "w-full");
    anchor.innerHTML = "View Details";
    anchor.setAttribute("onclick", "viewDetails(this)");
    articleElem.children[2].classList.add("line-clamp-4"); // Reset line clamp
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

/* Images aren't going to be used so I'll be commenting all of these

function changeImage(anchor) {
    const newImage = anchor.style.backgroundImage;
    const imageCarousel = anchor.parentElement.parentElement.children[0]; 
    const imageIndex = Array.from(anchor.parentElement.children).indexOf(anchor);
    imageCarousel.children[1].style.backgroundImage = newImage;
    imageCarousel.children[1].dataset.imageIndex = imageIndex;
    if (imageIndex > 0) {
        imageCarousel.children[0].style.backgroundImage = anchor.parentElement.children[imageIndex-1].style.backgroundImage;
    } else {
        imageCarousel.children[0].style.backgroundImage = "";
    }
    if (imageIndex < anchor.parentElement.children.length - 1) {
        imageCarousel.children[2].style.backgroundImage = anchor.parentElement.children[imageIndex+1].style.backgroundImage;
    } else {
        imageCarousel.children[2].style.backgroundImage = "";
    }
}

function nextImage(anchor, direction) {
    const imageCarousel = anchor.parentElement;
    const imagesGallary = imageCarousel.parentElement.children[1];
    nextIndex = direction + parseInt(imageCarousel.children[1].dataset.imageIndex)
    if (nextIndex < 0 || nextIndex > imagesGallary.children.length) {
        return //theres no -1 image or image over the length so lets just not.
    }
    changeImage(imagesGallary.children[nextIndex]);
}
*/

function createEntires(data) {
    for (resource of data) {
        createArticles(resource)
    }
}

let ws = new WebSocket("ws://localhost:8764");

ws.addEventListener("error", (e) => {
    console.log("uh oh error, we need a better way of displaying this maybe")
});
ws.addEventListener("open", () => {
    ws.send(JSON.stringify({"request" : "get_resources"}))
});
ws.addEventListener("message", (e) => {
    createEntires(JSON.parse(e.data))
});