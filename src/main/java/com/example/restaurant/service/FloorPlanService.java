//TODO: Hardcoded 10 - 15 tables

package com.example.restaurant.service;

import com.example.restaurant.model.Table;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FloorPlanService {

    private final List<Table> tables = List.of(
            new Table(1L, 2, "MAIN_HALL", 100, 100),
            new Table(2L, 4, "MAIN_HALL", 250, 100),
            new Table(3L, 6, "MAIN_HALL", 400, 100),
            new Table(4L, 2, "TERRACE", 100, 300),
            new Table(5L, 4, "TERRACE", 250, 300),
            new Table(6L, 8, "PRIVATE_ROOM", 500, 200)
    );

    public List<Table> getTables() {
        return tables;
    }
}