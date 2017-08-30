/**
 * Created by Christoph Richter on 29.12.2016.
 * Set of functions to generate training data for car detection. It includes positive and negative samples.
 *
 */

/**
 * Generates random images within a constant bounding box without cars and pack them in a zip file.
 * @param num Number of images to create
 * @param CARS Array of all cars in the scene
 * @param controls Camera controls (orbital camera controller)
 */
function generateNegativeTrainingData(num, CARS, controls) {
    var minX = -500;
    var maxX = 500;
    var minY = 0;
    var maxY = 200;
    var minZ = -500;
    var maxZ = 500;
    generateNegativeTrainingDataWithBB(num, minX, maxX, minY, maxY, minZ, maxZ, CARS, controls);
}

/**
 * Generates random images within a bounding box without cars and pack them in a zip file.
 * @param num Number of images to create
 * @param minX Bounding box min x coordinate
 * @param maxX Bounding box max x coordinate
 * @param minY Bounding box min y coordinate
 * @param maxY Bounding box max y coordinate
 * @param minZ Bounding box min z coordinate
 * @param maxZ Bounding box max z coordinate
 * @param CARS Array of all cars in the scene
 * @param controls Camera controls (orbital camera controller)
 */
function generateNegativeTrainingDataWithBB(num, minX, maxX, minY, maxY, minZ, maxZ, CARS, controls) {
    var zip = new JSZip();
    // make all cars invisible
    for (car in CARS) {
        CARS[car].object.visible = false;
    }
    var tar = controls.target;
    var orbitControl = controls.enabled;
    controls.enabled = true;
    // take n screenshots in random position and rotation
    for (i = 0; i < num; i++) {
        controls.target.setX(Math.floor(Math.random() * (maxX - minX + 1)) + minX);
        controls.target.setZ(Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ);
        camera.position.y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
        camera.position.x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        camera.position.z = Math.floor(Math.random() * (maxZ - minZ + 1)) + minZ;
        render();

        // add image to zip
        var temp = i.toString();
        for (var j = temp.length; j < 7; ++j) temp = "0" + temp;
        var img = renderer.domElement.toDataURL("image" + temp + "/png", "bg_" + temp + ".png");
        zip.folder("bg_images").file("bg_" + temp + ".png", img.substring(img.indexOf(","), img.length), {base64: true});
    }
    zip.generateAsync({type: "blob"})
        .then(function (blob) {
            saveAs(blob, "negativeTrainingDataCars.zip");
        });
    // make all cars visible again
    for (car in CARS) {
        CARS[car].object.visible = true;
    }
    controls.enabled = orbitControl;
}

