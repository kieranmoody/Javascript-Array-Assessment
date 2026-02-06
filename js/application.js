//Says that javascript is active and gives my webpage a js-enabled class, so I can make css changes accordingly
document.documentElement.classList.remove('js-disabled');
document.documentElement.classList.add("js-enabled");


//Image/div zooming

$(function () {
    $('.zoomable').on('click', function () {
        $.jAlert({
            type: 'html',
            size: 'xl', // largest built-in modal
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
                >
            `,
            closeOnClick: true,
            showClose: false,
        });
    });

    $('.zoomable-box').on('click', function () {
        $.jAlert({
            type: 'html',
            content: `
            <div style="display:flex; justify-content:center; align-items:center; padding: 10px; max-height: 85vh; overflow: auto;">
                ${$(this).clone().prop('outerHTML')}
            </div>
        `,
            size: 'lg',
            closeOnClick: true,
            showClose: false,
        });
    });

    $('.zoom-box a, .zoom-box button').on('click', function (e) {
    e.stopPropagation();
});
});


//---Input Section
//Image-Email-Link-Pt1
const imageAssignments = {};


//Image Provider
let currentImageValue ="";

function loadRandomImage() {
  currentImageValue = `https://picsum.photos/600/400?rand=${Date.now()}`;
  document.getElementById("random-image").src = currentImageValue;
}

loadRandomImage(); //Gives the first image

//Contact Form Verification

    //If the user has interacted with the form, do they really want to refresh?
let formInteraction = false;
const form = document.getElementById("email-form");

form.querySelectorAll("input, textarea").forEach(field => {
    field.addEventListener("input", () => {
        formInteraction = true;
    });
});

window.addEventListener("beforeunload", (event) => {
    if (!formInteraction) return;

    event.preventDefault();
});


    //Verifying the email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateForm() {
    const emailInput = document.getElementById("email-address");
    const email = emailInput.value.trim();

    //Checks to see if all the necessary forms are filled
    if (email=== "") {
        alert("Please enter an email address")
        return false; // stop submit, do NOT clear form
    }

    // Check email against regex
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return false; // stop submit, do NOT clear form
    }

    // If valid, clear the form (would be where the message is sent off)
    document.getElementById("email-form").reset();
    formInteraction = false;

//Image-Email-Link-Pt2
    // Create array if this email hasn't been seen before
    if (!imageAssignments[email]) {
    imageAssignments[email] = [];
    }

    // Store the image
    imageAssignments[email].push(currentImageValue);

    // Debug: prove it worked
    console.log(imageAssignments);

    loadRandomImage(); //Give new image

    return false; // prevent page refresh


}

//---Gallery Section

//Button press to show gallery
document
  .getElementById("show-gallery")
  .addEventListener("click", renderGallery);

//Show gallery
function renderGallery() {
    const gallery = document.getElementById("gallery-output");

    // Clear previous render
    gallery.innerHTML = "";

    // Loop over emails
    for (const email in imageAssignments) {
        const images = imageAssignments[email]; 

        const emailSection = document.createElement("div");
        emailSection.classList.add("gallery-email");

        const emailHeading = document.createElement("h3");
        emailHeading.textContent = email;
        emailHeading.style.textAlign = "center";
        emailHeading.style.marginTop = `10px`; // small gap below fixed box
        emailHeading.style.fontSize = "16px";
        emailHeading.style.color = "#333";

        const imagesContainer = document.createElement("div");
        imagesContainer.classList.add("gallery-images");

        images.forEach((imageUrl, index) => {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = `Image for ${email}`;

            const containerHeight = 220;   // same as CSS
            const imageHeight = 140;       // adjust based on image size you want
            const totalImages = images.length;
    
            let offset;
            if (totalImages === 1) {
                // Center the single image vertically in the box
                offset = (containerHeight - imageHeight) / 2;
            } else {
                // Spread images evenly from top to bottom
                const maxTop = containerHeight - imageHeight; // last image bottom
                offset = (maxTop / (totalImages - 1)) * index;
            }

            img.style.position = "absolute";
            img.style.top = `${offset}px`;
            img.style.zIndex = index;
            img.style.width = "100%";
            img.style.height = `${imageHeight}px`;
            img.style.borderRadius = "6px";
            img.style.objectFit = "cover"; // ensures images fill their box without distortion

            imagesContainer.appendChild(img);
        });

        
        emailSection.appendChild(imagesContainer);
        emailSection.appendChild(emailHeading);
        gallery.appendChild(emailSection);
    }
}



//Control Gallery Visibility
document.addEventListener("DOMContentLoaded", () => {
    const inputScreen = document.querySelector(".input-screen");
    const galleryScreen = document.querySelector(".gallery-screen");

    const showGalleryBtn = document.getElementById("show-gallery");
    const showInputBtn = document.getElementById("show-input");

    // SHOW GALLERY
    showGalleryBtn.addEventListener("click", () => {
        // 1. Make gallery visible underneath
        galleryScreen.style.display = "block";

        // 2. Slide input off screen
        inputScreen.style.transform = "translateX(-100%)";

        // 3. After animation, hide input
        setTimeout(() => {
            inputScreen.style.display = "none";
        }, 2000);
    });

    // SHOW INPUT
    showInputBtn.addEventListener("click", () => {
        // 1. Bring input back, but offscreen
        inputScreen.style.display = "block";
        inputScreen.style.transform = "translateX(-100%)";

        // Force browser to apply initial position
        inputScreen.offsetHeight; // reflow hack (intentional)

        // 2. Slide input back into view
        inputScreen.style.transform = "translateX(0)";

        // 3. After animation, hide gallery
        setTimeout(() => {
            galleryScreen.style.display = "none";
        }, 2000);
    });
});