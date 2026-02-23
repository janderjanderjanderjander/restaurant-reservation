package com.example.restaurant.controller;

import com.example.restaurant.model.Table;
import com.example.restaurant.model.Booking;
import com.example.restaurant.service.FloorPlanService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class FloorPlanController {

    private final FloorPlanService service;

    public FloorPlanController(FloorPlanService service) {
        this.service = service;
    }

    @GetMapping("/tables")
    public List<Table> getTables() {
        return service.getTables();
    }

    @GetMapping("/bookings")
    public List<Booking> getBookings(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return service.getBookingsFor(date);
    }
}