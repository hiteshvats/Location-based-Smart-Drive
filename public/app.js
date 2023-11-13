document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const imageInput = document.getElementById('imageInput');
    const uploadBtn = document.getElementById('uploadBtn');

    let currentCity = ''; // Store the current city for image upload

    getLocationBtn.addEventListener('click', () => {
        getLocationAndSetCity();
    });

    uploadBtn.addEventListener('click', () => {
        if (!currentCity) {
            alert('Please get location first.');
            return;
        }
        uploadImage();
    });

    function getLocationAndSetCity() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    reverseGeocode(latitude, longitude);
                },
                error => {
                    console.error('Error getting geolocation:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser');
        }
    }

    function reverseGeocode(latitude, longitude) {
        // Perform reverse geocoding to get the city name based on the coordinates.
        // For simplicity, we'll use a placeholder "City".
        const city = 'City';
        currentCity = city;
        alert(`Location set to: ${city}`);
    }

    function uploadImage() {
        const file = imageInput.files[0];
        if (!file) {
            alert('Please select an image to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        fetch(`/uploadImage/${currentCity}`, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            alert(data.message);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });
    }
});
