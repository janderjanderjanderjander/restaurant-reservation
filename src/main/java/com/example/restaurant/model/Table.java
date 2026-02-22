package com.example.restaurant.model;

public class Table {
    private Long id;
    private int seats;
    private String zone;
    private int x;
    private int y;

    public Table(Long id, int seats, String zone, int x, int y) {
        this.id = id;
        this.seats = seats;
        this.zone = zone;
        this.x = x;
        this.y = y;
    }

    public Long getId() { return id; }
    public int getSeats() { return seats; }
    public String getZone() { return zone; }
    public int getX() { return x; }
    public int getY() { return y; }
}