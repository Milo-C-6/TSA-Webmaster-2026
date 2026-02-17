function createArticles(data) {
    // if (color == "none") {
    //     colors = ["red", "green", "violet", "purple"] 
    //     // supposedly "slate", "cyan", "rose", "lime", "neutral", "amber", "orange", "sky", "gray", "teal", "indigo", "emerald", "pink", "fuchsia", "zinc", "stone", "yellow", "blue" are all colors but they dont work
    //     color = colors[Math.floor(Math.random() * (colors.length - 1))]
    // }

    const newArticle = document.createElement("article");
    newArticle.classList.add(`bg-${data[3]}-200`, "p-4", "rounded-lg", "w-full");
    // I probably just dont know how to use sql, but sql is evil and gave the data in arrays without keys, so sorry if the indexing looks a bit unreedable
    // 0: id, 1: title, 2: description 3: color 4: location 5: type
    newArticle.dataset.rId = parseInt(data[0]);
    newArticle.innerHTML = `<h3 class="text-2xl font-bold">${data[1]}</h3>
<p class="mt-2 line-clamp-4">${data[2]}</p>
<a href="javascript:void(0)" onclick="viewDetails(this)" class="flex items-center justify-center bg-blue-300 rounded-md w-full text-gray-900 py-1">View Details</a>`;
    document.getElementById(data[5]).append(newArticle);
}

function viewDetails(anchor) {
    // Move items to a new section beneathe it, and hide the current items
    let curChildren = Array.from(anchor.parentElement.parentElement.children);
    const newSection = document.createElement("section");
    newSection.classList.add("grid", "sm:grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3", "2xl:grid-cols-4", "justify-center", "gap-4");
    for (item of curChildren.slice(curChildren.indexOf(anchor.parentElement)+1)) {
        newSection.appendChild(item);
    }
    anchor.parentElement.parentElement.insertAdjacentElement("afterend", newSection);
    anchor.parentElement.style.display = "none";
    // find info
    title = anchor.parentElement.children[0].innerHTML
    description = anchor.parentElement.children[1].innerHTML
    // Create details
    const newDetails = document.createElement("article");
    newDetails.classList.add("bg-gray-200", "rounded-md", "flex", "my-2", "w-full");
    newDetails.style.height = "75vh";
    newDetails.innerHTML = `<summary class="bg-green-200 w-1/3 rounded-tl-md rounded-bl-md p-2">
    <h3 class="text-2xl font-bold">${title}</h3>
    <p class="mt-2">${description}</p>
    <ul class="list-disc list-inside">
    <li>this is</li>
    <li>incredibly</li>
    <li>work in</li>
    <li>progress</li>
    </ul>
</summary>
<aside class="bg-amber-200 h-full w-2/3 rounded-tr-md rounded-br-md">
    <div class="flex w-full h-3/4 bg-black rounded-tr-md">
    <a href="javascript:void(0)" onclick="nextImage(this, -1)" class="w-1/8 h-full block bg-center bg-cover bg-clip-content p-5 -skew-y-12 -scale-x-100" style="background-image: url('src/media/placeholder.svg');"></a>
    <div data-image-index="1" class="grow bg-no-repeat bg-center bg-contain" style="background-image: url(src/media/background.jpg);"></div>
    <a href="javascript:void(0)" onclick="nextImage(this, 1)" class="w-1/8 h-full block bg-center bg-cover bg-clip-content p-5 skew-y-12" style="background-image: url('src/media/placeholder.svg');"></a>
    </div>
    <div class="bg-gray-700 h-1/8 flex overflow-scroll">
    <a href="javascript:void(0)" onclick="changeImage(this)" class="h-full aspect-square border border-black bg-center bg-cover" style="background-image: url('src/media/placeholder.svg');"></a>
    <a href="javascript:void(0)" onclick="changeImage(this)" class="h-full aspect-square border border-black bg-center bg-cover" style="background-image: url('src/media/background.jpg');"></a>
    <a href="javascript:void(0)" onclick="changeImage(this)" class="h-full aspect-square border border-black bg-center bg-cover" style="background-image: url('src/media/placeholder-1.svg');"></a>
    <a href="javascript:void(0)" onclick="changeImage(this)" class="h-full aspect-square border border-black bg-center bg-cover" style="background-image: url('src/media/placeholder-2.svg');"></a>
    </div>
    <a href="javascript:void(0)" onclick="closeDetails(this)" class="bg-red-300 px-7 py-1 rounded-md">Close</a>
</aside>`;
    newSection.insertAdjacentElement("beforebegin", newDetails);
} // holy wall of text slop code

function closeDetails(anchor) {
    const ogSection = anchor.parentElement.parentElement.previousElementSibling;
    const afterSection = anchor.parentElement.parentElement.nextElementSibling;
    anchor.parentElement.parentElement.remove();
    ogSection.children[ogSection.children.length - 1].style.display = "block";
    for (item of Array.from(afterSection.children)) { // not doing "Array.from()" for some reason skips the last one
        ogSection.appendChild(item);
    }
    afterSection.remove();
}

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