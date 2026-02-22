package com.example.restaurant.controller;

import com.example.restaurant.model.Table;
import com.example.restaurant.service.FloorPlanService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FloorPlanController {

    private final FloorPlanService service;

    public FloorPlanController(FloorPlanService service) {
        this.service = service;
    }

    @GetMapping("/tables")
    public List<Table> getTables() {
        return service.getTables();
    }
}