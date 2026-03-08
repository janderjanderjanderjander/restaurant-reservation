#!/bin/bash

stop_pid() {
  if [ -f "$1" ]; then
    PID=$(cat "$1")

    kill "$PID" 2>/dev/null || true

    for i in {1..5}; do
      if ! kill -0 "$PID" 2>/dev/null; then
        rm "$1"
        return
      fi
      sleep 1
    done

    kill -9 "$PID" 2>/dev/null || true
    rm "$1"
  fi
}

stop_pid backend.pid
stop_pid frontend.pid