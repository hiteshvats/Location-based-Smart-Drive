document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const imageInput = document.getElementById('imageInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const dropBox = document.getElementById('dropBox');
    const previewImage = document.getElementById('previewImage');

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

    dropBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropBox.style.border = '2px solid #4caf50';
    });

    dropBox.addEventListener('dragleave', () => {
        dropBox.style.border = '2px dashed #ccc';
    });

    dropBox.addEventListener('drop', (e) => {
        e.preventDefault();
        dropBox.style.border = '2px dashed #ccc';
        handleDrop(e.dataTransfer.files);
    });

    imageInput.addEventListener('change', (e) => {
        handleDrop(e.target.files);
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

    function handleDrop(files) {
        const file = files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    }
});
