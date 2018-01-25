describe("OrgUnitImporterSpec", function() {
    beforeAll(function() {
        refColumn = "B";
      });
      
    it("B for parentIsRef(1) false", function() {
        expect(parentIsRef(1)).toEqual(false);
    });
    it("B for parentIsRef(2) true", function() {
        expect(parentIsRef(2)).toEqual(true);
    });
    it("B for parentIsRef(3) false", function() {
        expect(parentIsRef(3)).toEqual(false);
    });


});