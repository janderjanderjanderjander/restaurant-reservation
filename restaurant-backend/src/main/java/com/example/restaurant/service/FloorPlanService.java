//TODO: Hardcoded 10 - 15 tables

package com.example.restaurant.service;

import com.example.restaurant.model.Table;
import org.springframework.stereotype.Service;
import com.example.restaurant.model.Booking;

import java.util.List;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class FloorPlanService {

    private final List<Table> tables = List.of(
            new Table(1L, 2, "MAIN_HALL", 50, 100),
            new Table(2L, 4, "MAIN_HALL", 200, 100),
            new Table(3L, 6, "MAIN_HALL", 350, 100),
            new Table(4L, 2, "TERRACE", 50, 300),
            new Table(5L, 4, "TERRACE", 200, 300),
            new Table(6L, 8, "PRIVATE_ROOM", 500, 200)
    );

    public List<Table> getTables() {
        return tables;
    }


    public List<Booking> getBookingsFor(LocalDate date) {
        return generateBookingsFor(date);
    }
    //Generates 18 random bookings for entered date. Removes overlapping bookings, so bookins could be <18. 
    private List<Booking> generateBookingsFor(LocalDate date) {
        long seed = date.toEpochDay(); //random seed for each day
        Random r = new Random(seed);
        Map<Long, List<Booking>> bookingsByTable = new HashMap<>();
        List<Booking> result = new ArrayList<>();

        LocalTime open = LocalTime.of(12, 0);
        LocalTime close = LocalTime.of(22, 0);
        int[] durations = {90, 120, 150, 180};

        int bookingCount = 18;
        int minutesRange = (int) Duration.between(open, close).toMinutes();

        for (int i = 0; i < bookingCount; i++) {
            long tableId = tables.get(r.nextInt(tables.size())).getId(); //random table id
            
            int slot = r.nextInt((minutesRange - 60) / 15); //random start time in minutes also for each 15 min
            int startOffset = slot * 15; //where is it in real time
            LocalDateTime start = LocalDateTime.of(date, open).plusMinutes(startOffset); //Start of booking

            //duration of this booking
            int duration = durations[r.nextInt(durations.length)];
            //start + duration
            LocalDateTime end = start.plusMinutes(duration);

            //generate booking as candidate
            Booking candidate = new Booking(tableId, start, end);

            //get bookings for table in question
            List<Booking> existingForTable = bookingsByTable.getOrDefault(tableId, List.of());

            //check if booking overlaps
            if (overlapsAny(existingForTable, candidate)) {
                continue; //skip this one if overlap
            }

            //add the candidate to overall list
            result.add(candidate);
            //add to mapping
            bookingsByTable
                .computeIfAbsent(tableId, k -> new ArrayList<>())
                .add(candidate);
        }
        return result;
    }

    //Helper function to detect overlaps
    private boolean overlapsAny(List<Booking> existing, Booking candidate) {
        for (Booking b : existing) {
            if (overlaps(b.start(), b.end(), candidate.start(), candidate.end())) return true;
        }
        return false;
    }

    // Standard overlap detection from google
    private boolean overlaps(LocalDateTime aStart, LocalDateTime aEnd,
                             LocalDateTime bStart, LocalDateTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }

    //TODO - Method to return occupied tables
}