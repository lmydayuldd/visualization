package visualization.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/test")
public class TestController {

    @RequestMapping(value = "/{name}", method = RequestMethod.GET, produces = "application/json")
    public @ResponseBody String[] test(@PathVariable String name) {
        String[] result = new String[]{name, name, name};
        return result;
    }

}
