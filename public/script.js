// Define a function to get location data and send a POST request
function getLocationAndSendData() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Create an object with the data to be sent
            const locationData = {
                latitude: latitude,
                longitude: longitude,
            }; 

            // Convert the data to URL-encoded format
            const formData = new URLSearchParams(locationData).toString();

            // Send a POST request to your server with the URL-encoded data
            fetch("/location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            })
            .then(() => {
                // After the request is successful, reload the page
                location.reload();
            })
            .catch((error) => {
                console.log("Error sending location data:", error);
            });
        });
    } else {
        alert("Geolocation is not supported in your browser.");
    }
}

// Add an event listener to the form submit button
const locationForm = document.getElementById("locationForm");
const submitButton = locationForm.querySelector("button");

submitButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default form submission
    getLocationAndSendData(); // Call the function to get location and send data
});

// Function to fetch and update the time element with the current time
