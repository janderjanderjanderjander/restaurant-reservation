package com.example.restaurant.model;

import java.time.LocalDateTime;

public record Booking(
        long tableId,
        LocalDateTime start,
        LocalDateTime end
) {}