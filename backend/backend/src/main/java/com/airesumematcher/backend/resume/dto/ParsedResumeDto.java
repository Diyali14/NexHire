package com.airesumematcher.backend.resume.dto;


import com.airesumematcher.backend.resume.dto.ResumeDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

// import tools.jackson.databind.ObjectMapper; // version 2.11.1
// import com.fasterxml.jackson.annotation.JsonProperty; // version 2.11.1
/* ObjectMapper om = new ObjectMapper();
Root root = om.readValue(myJsonString, Root.class); */
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
// class Education{
//    public String degree;
//    public String institution;
//    public String end_year;
//    public String grade;
//}
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
// class Experience{
//    public String company;
//    public String job_title;
//    public String location;
//    public ArrayList<String> responsibilities;
//    public ArrayList<String> technologies;
//    public ArrayList<Object> additional_information;
//    public String start_date;
//    public String end_date;
//}
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
// class Links{
//    public String linkedin;
//    public String website;
//}
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
// class Project{
//    public String name;
//    public String description;
//}
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
// class Resume{
//    public String name;
//    public String email;
//    public String phone;
//    public ArrayList<Skill> skills;
//    public ArrayList<Education> education;
//    public ArrayList<Experience> experience;
//    public int years_of_experience;
//    public ArrayList<Project> projects;
//    public String certifications;
//    public Links links;
//}
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedResumeDto {
    public String status;
    public String language;
    public ResumeDto resume;
    public ArrayList<Object> warnings;
    public String parserVersion;
}
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
// class Skill{
//    public String name;
//    public String normalizedName;
//    public int confidence;
//}