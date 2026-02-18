function showSpecificFields(form) {
    if (form.type.value == "event") {
        sField = form.startTime; // sField: Special or Specific field, specific fields that event and resource dont share
        oField = form.resourceType;
    } else {
        sField = form.resourceType;
        oField = form.startTime
    }
    sField.optional = false
    sField.required = true
    sField.style.height = "inherit";
    sField.style.display = "block";
    oField.optional = true
    oField.required = false
    oField.style.height = "0";
    oField.style.display = "none";
}
document.getElementById("entryForm").addEventListener('submit', function(event) {
    event.preventDefault();
    form = event.target;

    data = {
            "title" : form.eventname.value,
            "password" : form.password.value,
            "description" : form.description.value,
            "color" : form.color.value,
            "location" : form.location.value,
    }   

    // form.id is set by javascript lower, the user won't set id by accendent
    if (form.id.value != null) {
        data["request"] = "edit_"+form.type.value+"s"
        data["id"] = form.id.value
        console.log(data["id"])
    } else {
        data["request"] = "create_"+form.type.value+"s"
    }

    if (form.type.value == "event") {
        data["start"] = form.startTime.value;
    } else {
        data["type"] = form.resourceType.value;
    }
    
    statusElem = document.getElementById("formStatus");
    statusElem.innerHTML = "Sending form...";
    statusElem.style.color = "black";
    statusElem.style.display = "block";

    console.log("still doing something")
    let ws = new WebSocket("ws://localhost:8764");
    ws.addEventListener("error", (e) => {
        console.log("eyyyikes! we got an error");
        statusElem.innerHTML = "An Unknown Error Occurred";
        statusElem.style.color = "red"
    });
    ws.addEventListener("open", () => {
        ws.send(JSON.stringify(data));
    });
    ws.addEventListener("message", (e) => {
        if (e.data == "1") {
            statusElem.innerHTML = "Successfully sent form!";
            statusElem.style.color = "green";
        } else if (e.data == "2") {
            statusElem.innerHTML = "Incorrect password";
            statusElem.style.color = "red";
        } else {
            statusElem.innerHTML = "An Unknown Error Occurred";
            statusElem.style.color = "red";
        }
    });
})

// Check in URL options if the user is editing an entry 
let q = window.location.search;
if ((typeof q === "string") && q[0] === "?" && (typeof window.URLSearchParams !== "undefined")) {
    q = new window.URLSearchParams(q);
    id = q.get("id");
    type = q.get("type");
    if (id != null & (type == "event" || type=="resource")) {
        // Evidence shows they're editing an entry, change the form so they don't change things they can't, and specify the id. Submit function will intepret this as editing.
        let form = document.getElementById("entryForm");
        form.type.value = type;
        form.type.disabled = true;
        form.id.value = id;
        form.type.onchange()
    }
}