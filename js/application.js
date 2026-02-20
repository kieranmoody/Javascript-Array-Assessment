//General Variables
const website = document.querySelector(".web");
const showGalleryBtn = document.getElementById("show-gallery");
const UNSPLASH_KEY = "t8j_g8ckWuHTXzBb1J2_Y72PqEjIhkuUfoP8bMGe3vc";

// --- Image Variables
let currentImageValue = "";
const img = document.getElementById("random-image");
const frame = document.getElementById("random-image-frame");

//Email Validation
let formDirty = false;
const emailField = document.getElementById("email-address");
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//Image-Email-Link-Pt1
const imageAssignments = {};

//Says that javascript is active and gives my webpage a js-enabled class, so I can make css changes accordingly
document.documentElement.classList.remove("js-disabled");
document.documentElement.classList.add("js-enabled");

//---DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    loadRandomImage(); //First Image Load

    //Control Gallery Visibility
    const inputScreen = document.querySelector(".input-screen");
    const galleryScreen = document.querySelector(".gallery-screen");
    const showInputBtn = document.getElementById("show-input");
    const newImageBtn = document.getElementById("next-image")

    newImageBtn.addEventListener("click", () => {
        loadRandomImage(); //Give new image
    })

    //No emails yet? Give the button a class so I can cs it to look different and disable it
    if (Object.keys(imageAssignments).length === 0) {
        showGalleryBtn.classList.add("empty-gallery");
    } 

    //SHOW GALLERY
    showGalleryBtn.addEventListener("click", () => {
        //Stops the button from working if website is "transitioning" or it has no emails
        if (website.classList.contains("transitioning") || showGalleryBtn.classList.contains("empty-gallery") ) return 

        //Website is transitioning
        website.classList.add("transitioning");
        
        //Make gallery visible underneath
        galleryScreen.style.display = "block";

        //Slide input off screen
        inputScreen.style.transform = "translateX(-100%)";

        //After slide, hide input
        setTimeout(() => {
            inputScreen.style.display = "none";
            website.classList.remove("transitioning");
        }, 2000);
    });

    //SHOW INPUT (Same as show gallery but reversed - minus the empty gallery part)
    showInputBtn.addEventListener("click", () => {

        if (website.classList.contains("transitioning")) return

        website.classList.add("transitioning");
        //Bring input back, but offscreen
        inputScreen.style.display = "block";
        inputScreen.style.transform = "translateX(-100%)";

        //Force browser to fully render the screen, so that it actually does the transition rather than trying to take shortcuts
        inputScreen.offsetHeight; 

        //Slide input back into view
        inputScreen.style.transform = "translateX(0)";

        //After slide, hide gallery
        setTimeout(() => {
            galleryScreen.style.display = "none";
            website.classList.remove("transitioning");
        }, 2000);  
    });
});


//---Input Section
//Image Provider

//Loads a random image upon request
async function loadRandomImage() {
    let imageSeed = Math.floor(Math.random() * 1000000); //new seed for image

    //Detects the size details, and then rounds them to whole numbers
    const rect = frame.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    
    //Decide provider
    const provider = Math.random() < 0.2 ? "unsplash" : "picsum";
    console.log(provider);
    //Creates a fallback to picsum if upsplash fails for api or other reasons
    if (provider === "picsum") {
        currentImageValue = `https://picsum.photos/seed/${imageSeed}/${width}/${height}`;
    } else {
        try {
            const response = await fetch( //Calls the unsplash api
                `https://api.unsplash.com/photos/random?orientation=landscape&client_id=${UNSPLASH_KEY}`
            );

            // IMPORTANT: check HTTP status
            if (!response.ok) throw new Error("Unsplash API error"); //Api error

            const data = await response.json();

            // IMPORTANT: check structure
            if (!data || !data.urls || !data.urls.regular) { //Data error
                throw new Error("Invalid Unsplash data");
            }

            currentImageValue = data.urls.regular; //Everything valid, great!

        } catch (err) { //Error received? fall back to picsum
            console.warn("Unsplash failed, falling back to Picsum:", err);

            currentImageValue =
                `https://picsum.photos/seed/${imageSeed}/${width}/${height}`;
        }
        img.onerror = () => { //Image doesnt load? Fall back to picsum
            console.warn("Image failed to load — switching to Picsum fallback");
            img.src = `https://picsum.photos/seed/${imageSeed}/${currentWidth}/${currentHeight}`;
        };

    }

//Loads the image in the background, preventing flickering appearance
    const preloader = new Image();
    preloader.src = currentImageValue;
    preloader.onload = () => {
        img.src = currentImageValue;
        img.style.opacity = "1";
    };
}

//Looks for the frame to resize, resizes the image to suit
const observer = new ResizeObserver(entries => {
    const rect = entries[0].contentRect;
    img.style.width = Math.round(rect.width) + "px";
    img.style.height = Math.round(rect.height) + "px";
});
observer.observe(frame);

//Contact Form Verification
//If the user has content in the form, do they really want to refresh?
window.addEventListener("beforeunload", (event) => {
    if (!formDirty) return;
    event.preventDefault();
});

//The user has typed something = dirty form
emailField.addEventListener("input", () => {
    formDirty = emailField.value.trim().length !== 0;
});

//Verifying the email
function validateForm() {
    const emailInput = document.getElementById("email-address");
    const email = emailInput.value.trim();

    //Checks to see if all the necessary forms are filled
    if (email === "") {
        setEmailError("Please enter an email address");
        emailInput.focus();
        return false; //stop submit, do NOT clear form
    }

    //Check email against regex
    if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address");
        emailInput.focus();
        return false; //stop submit, do NOT clear form
    }

    setEmailError(); //Provides visual feedback for the user's mistakes
    emailInput.classList.add("input-valid");
    //If valid, clear the form (would be where the message is sent off)
    document.getElementById("email-form").reset();
    emailInput.classList.remove("input-valid");
    formDirty = false; //Form is no longer dirty, user refresh with no prompt

    //Does this email already exist?
    if (!imageAssignments[email]) {
        //console.log("email does not exist");
    } else if (imageAssignments[email].includes (currentImageValue)) {
        setEmailError("This email has already been associated with this image");
        emailInput.focus();
        //console.log("email exists, and has been attatched to the image");
        return false;
    }
        //console.log("if statement passed");
        
    //Image-Email-Link-Pt2
    //Create array if this email hasn't been seen before
    if (!imageAssignments[email]) {
    imageAssignments[email] = [];
    }

    //Store the image
    imageAssignments[email].push(currentImageValue);
    updateEmailList();
    showGalleryBtn.classList.remove("empty-gallery");

    //Debug - does it work?
    console.log(imageAssignments);

    showFormStatus("Image saved to gallery ✓");

    return false; //Prevent page refresh
}

function updateEmailList() {
    const emailList = document.getElementById("email-list");
    emailList.innerHTML = "";//clears the list to avoid duplication of emails

    //object.keys gives me all the emails
    Object.keys(imageAssignments).forEach(email => {
        const option = document.createElement("option");
        option.value = email;
        emailList.appendChild(option);
    });
}

const status = document.getElementById("form-status");
//Email success
function showFormStatus(message) {
    

    //Reset animation, so they get full feedback every time
    status.classList.remove("show");
    void status.offsetHeight; //Force reflow

    status.textContent = message;
    status.classList.add("show");//How I control the aesthetics

    clearTimeout(status._timeout);
    status._timeout = setTimeout(() => {
        status.classList.remove("show");
    }, 3000);
}

//Email fail
function setEmailError(message = "") {
    const error = document.getElementById("email-error");
    const input = document.getElementById("email-address");

    if (message) {
        error.textContent = message;
        error.classList.add("show");
        input.classList.add("input-invalid");
        input.classList.remove("input-valid");
        status.classList.remove("show");
        if (message === "This email has already been associated with this image"){
            message._timeout = setTimeout(() => {
                error.classList.remove("show");
                input.classList.add("input-invalid");
            }, 3000);
        }
    } else {
        error.textContent = "";
        error.classList.remove("show");
        input.classList.remove("input-invalid");
    }
}

document.getElementById("email-address").addEventListener("input", (e) => {
    const value = e.target.value.trim();

    if (emailRegex.test(value)) {
        setEmailError();
        e.target.classList.add("input-valid");
    } else {
        e.target.classList.remove("input-valid");
    }
});


//---Gallery Section
//Button press to show gallery
document
  .getElementById("show-gallery")
  .addEventListener("click", renderGallery);

//Builds the html for the gallery
function renderGallery() {
    const gallery = document.getElementById("gallery-output");

    //Clears previous build
    gallery.innerHTML = "";

    //Loop over emails, creating the elements for the page
    for (const email in imageAssignments) {

        const images = imageAssignments[email];

        const emailSection = document.createElement("div");
        emailSection.classList.add("gallery-box");
        emailSection.classList.add("zoomable-box");

        const emailHeading = document.createElement("h3");
        emailHeading.classList.add("gallery-email");
        emailHeading.textContent = email;

        const imagesContainer = document.createElement("div");
        imagesContainer.classList.add("gallery-images");

        emailSection.appendChild(imagesContainer);
        emailSection.appendChild(emailHeading);
        gallery.appendChild(emailSection);


        //These mean that it waits for 1 image to load, measures it, and then positions it later
        let imagesLoaded = 0;
        let imageHeight = null;

        //Creates the image
        images.forEach((imageUrl) => {
            //Gets the image from source, gives each image a class so I can change things about it in css, as well as an alt tag
            const img = document.createElement("img");
            img.classList.add("gallery-image");
            img.src = imageUrl;
            img.alt = `Image for ${email}`;

            imagesContainer.appendChild(img);

            //Waits for the image to actually load (otherwise height doesnt work)
            img.addEventListener("load", () => {

                //Counts every time an image loads
                imagesLoaded++;

                //Measure only once (after first image loads - "if I do not know imageHeight yet")
                if (imageHeight === null) {
                    imageHeight = img.getBoundingClientRect().height;
                }

                //When every image loads, this will be true
                if (imagesLoaded === images.length) {

                    //Ensure container layout exists, gives the container height from my css
                    imagesContainer.offsetHeight;
                    const containerHeight = imagesContainer.getBoundingClientRect().height;


                    const totalImages = images.length;
                    //How low can my image go? (Limbo!)
                    const maxTop = containerHeight - imageHeight;

                    //For every single image inside the container
                    [...imagesContainer.children].forEach((imgEl, index) => { //... = spread opperator - makes a frozen array copy, so I can loop through it without fear of sudden changes

                        let offset;
                        //How will the image look with 1 image, and with everything else
                        if (totalImages === 1) {
                            offset = maxTop / 2;
                        } else {
                            offset = (maxTop / (totalImages - 1)) * index;
                        }
                        //Applies some position-related styles
                        imgEl.style.top = `${offset}px`;
                        imgEl.style.zIndex = index;
                    });
                }
            });
        });
    }
}


//---Extras
//Image/div zooming

$(function () {
    $(document).on('click', '.zoomable', function () {
        if (website.classList.contains("transitioning")) return //Stops the user from clicking a box while zoomed

        $.jAlert({
            type: 'html',
            size: 'xl',
            content: `
                <img 
                    src="${this.src}" 
                    style="
                        max-width: 100%;
                        max-height: 85vh;
                        width: auto;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                    "
                `,
            closeOnClick: true,
            showClose: false,
        });
    });

    $(document).on('click', '.zoomable-box', function () {
        if (website.classList.contains("transitioning")) return

        const images = $(this).find('img');
        const email = $(this).find('.gallery-email').text();

        let galleryHTML = `
            <div class="zoom-gallery">
                <h2 class="zoom-email">${email}</h2>
                <div class="zoom-grid">
        `;

        images.each(function(){
            galleryHTML += `<img src="${this.src}" class="zoom-grid-img">`;
        });

        galleryHTML += `</div></div>`;

        $.jAlert({
            type: 'html',
            size: 'xl',
            content: galleryHTML,
            closeOnClick: true,
            showClose: false
        });
    });

    $('.zoom-box a, .zoom-box button').on('click', function (e) {
    e.stopPropagation();
});
});
