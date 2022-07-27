from sqlalchemy.ext.declarative import DeclarativeMeta
import json
import datetime


class AlchemyEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            # an SQLAlchemy class
            fields = {}

            for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata' and x != 'method']:
                data = obj.__getattribute__(field)

                if str(data).find('method') < 1 or str(data).startswith('query') < 1:
                    try:

                        if isinstance(data, datetime.date):
                            value = data.strftime('%Y-%m-%d')
                        else:
                            value = data

                        json.dumps(value)
                        fields[field] = value

                    except TypeError:
                        fields[field] = None
            # a json-encodable dict
            return fields

        return json.JSONEncoder.default(self, obj)
