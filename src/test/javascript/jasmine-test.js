describe('Visualization services', function() {
    
    var scene;
    var tLoader;
    
    var eb;
    
    //reinitialize gloabal variables for each test
    beforeEach(function () {
        scene = new THREE.Scene();
        tLoader = new THREE.TextureLoader();
    });
    
    
    
    it('creates EnvBuilder', function() {
        eb = new EnvBuilder(tLoader, scene);
        expect(eb).not.toBeNull();
    });
    
    it('is chainable EnvBuilder', function () {
        eb = new EnvBuilder(tLoader, scene);
        var result = eb.addIntersection();
        expect(eb).toEqual(result);
    });
});