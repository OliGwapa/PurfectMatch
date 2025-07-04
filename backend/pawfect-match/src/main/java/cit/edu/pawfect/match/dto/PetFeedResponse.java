package cit.edu.pawfect.match.dto;

public class PetFeedResponse {
    private String petId;
    private String userId; // Add userId field
    private String name;
    private String species;
    private String breed;
    private String photoUrl;
    private String description;
    private String pedigreeInfo;
    private String healthStatus;
    private double price; // Add price field
    private String availabilityStatus; // Add availability field

    public PetFeedResponse() {}

    // Updated constructor with all fields
    public PetFeedResponse(String petId, String userId, String name, String species, String breed, 
                          String photoUrl, String description, String pedigreeInfo, String healthStatus, 
                          double price, String availabilityStatus) {
        this.petId = petId;
        this.userId = userId;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.photoUrl = photoUrl;
        this.description = description;
        this.pedigreeInfo = pedigreeInfo;
        this.healthStatus = healthStatus;
        this.price = price;
        this.availabilityStatus = availabilityStatus;
    }

    // Constructor without pedigreeInfo and healthStatus (for backward compatibility)
    public PetFeedResponse(String petId, String name, String species, String breed, String photoUrl, String description) {
        this.petId = petId;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.photoUrl = photoUrl;
        this.description = description;
    }

    // Previous constructor with pedigreeInfo and healthStatus
    public PetFeedResponse(String petId, String name, String species, String breed, String photoUrl, String description, String pedigreeInfo, String healthStatus) {
        this.petId = petId;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.photoUrl = photoUrl;
        this.description = description;
        this.pedigreeInfo = pedigreeInfo;
        this.healthStatus = healthStatus;
    }

    // Getters and Setters
    public String getPetId() {
        return petId;
    }

    public void setPetId(String petId) {
        this.petId = petId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPedigreeInfo() {
        return pedigreeInfo;
    }

    public void setPedigreeInfo(String pedigreeInfo) {
        this.pedigreeInfo = pedigreeInfo;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(String availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }
}