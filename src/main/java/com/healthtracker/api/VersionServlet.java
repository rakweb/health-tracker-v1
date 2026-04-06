package com.healthtracker.api;

import com.healthtracker.util.AppVersion;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/version")
public class VersionServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");

        String json = String.format(
            "{\"version\":\"%s\",\"buildDate\":\"%s\"}",
            AppVersion.getVersion(),
            AppVersion.getBuildDate()
        );

        res.getWriter().write(json);
    }
}
